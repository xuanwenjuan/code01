package com.naturaldye.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.naturaldye.annotation.OperationLog;
import com.naturaldye.common.BusinessException;
import com.naturaldye.dto.WorkOrderCompleteDTO;
import com.naturaldye.dto.WorkOrderCreateDTO;
import com.naturaldye.dto.WorkOrderMaterialDTO;
import com.naturaldye.entity.ColorCategory;
import com.naturaldye.entity.DyeWorkOrder;
import com.naturaldye.entity.WorkOrderMaterial;
import com.naturaldye.enums.WorkOrderStatusEnum;
import com.naturaldye.mapper.DyeWorkOrderMapper;
import com.naturaldye.mapper.WorkOrderMaterialMapper;
import com.naturaldye.util.RedisUtil;
import com.naturaldye.vo.CostDetailVO;
import com.naturaldye.vo.WorkOrderDetailVO;
import com.naturaldye.vo.WorkOrderMaterialVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DyeWorkOrderService {

    private final DyeWorkOrderMapper dyeWorkOrderMapper;
    private final WorkOrderMaterialMapper workOrderMaterialMapper;
    private final ColorCategoryService colorCategoryService;
    private final InventoryService inventoryService;
    private final CostAccountingService costAccountingService;
    private final RedisUtil redisUtil;
    private final ObjectMapper objectMapper;

    private static final String WORK_ORDER_CACHE_KEY = "work:order:";

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "工单管理", operation = "创建工单", description = "创建染制工单")
    public Long createWorkOrder(WorkOrderCreateDTO createDTO) {
        if (createDTO.getCategoryId() != null) {
            if (!colorCategoryService.isCategoryActive(createDTO.getCategoryId())) {
                throw new BusinessException("该色系类目已下架，无法创建工单");
            }
        }

        String orderNo = generateOrderNo();
        DyeWorkOrder workOrder = new DyeWorkOrder();
        BeanUtils.copyProperties(createDTO, workOrder);
        workOrder.setOrderNo(orderNo);
        workOrder.setStatus(WorkOrderStatusEnum.PENDING.getCode());
        dyeWorkOrderMapper.insert(workOrder);

        if (createDTO.getMaterials() != null && !createDTO.getMaterials().isEmpty()) {
            for (WorkOrderMaterialDTO materialDTO : createDTO.getMaterials()) {
                WorkOrderMaterial material = new WorkOrderMaterial();
                BeanUtils.copyProperties(materialDTO, material);
                material.setWorkOrderId(workOrder.getId());
                calculateMaterialTotalPrice(material);
                workOrderMaterialMapper.insert(material);
            }
        }

        if (createDTO.getCategoryId() != null) {
            colorCategoryService.incrementCategoryUsage(createDTO.getCategoryId());
        }

        log.info("工单创建成功，工单号: {}", orderNo);
        return workOrder.getId();
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "工单管理", operation = "确定配色锁定库存", description = "工单确定配色，锁定物料库存")
    public void confirmColorAndLockInventory(Long workOrderId, List<WorkOrderMaterialDTO> materials) {
        DyeWorkOrder workOrder = dyeWorkOrderMapper.selectById(workOrderId);
        if (workOrder == null) {
            throw new BusinessException("工单不存在");
        }
        if (workOrder.getStatus() != WorkOrderStatusEnum.PENDING.getCode()) {
            throw new BusinessException("工单状态不正确，当前状态: " + workOrder.getStatus());
        }

        if (materials == null || materials.isEmpty()) {
            throw new BusinessException("用料清单不能为空");
        }

        for (WorkOrderMaterialDTO materialDTO : materials) {
            inventoryService.lockInventory(
                    materialDTO.getInventoryId(),
                    materialDTO.getQuantity(),
                    workOrderId
            );

            WorkOrderMaterial material = new WorkOrderMaterial();
            BeanUtils.copyProperties(materialDTO, material);
            material.setWorkOrderId(workOrderId);
            material.setStatus(1);
            calculateMaterialTotalPrice(material);
            workOrderMaterialMapper.insert(material);
        }

        workOrder.setStatus(WorkOrderStatusEnum.PREPROCESSING.getCode());
        workOrder.setFeedingTime(LocalDateTime.now());
        dyeWorkOrderMapper.updateById(workOrder);

        clearWorkOrderCache(workOrderId);
        log.info("工单确定配色成功，工单号: {}, 锁定物料数: {}", workOrder.getOrderNo(), materials.size());
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "工单管理", operation = "工单流转", description = "工单流转到下一工序")
    public void processNextStatus(Long workOrderId) {
        DyeWorkOrder workOrder = dyeWorkOrderMapper.selectById(workOrderId);
        if (workOrder == null) {
            throw new BusinessException("工单不存在");
        }

        Integer currentStatus = workOrder.getStatus();
        if (currentStatus.equals(WorkOrderStatusEnum.PAUSED.getCode())) {
            throw new BusinessException("工单已暂停，请先恢复工单");
        }
        if (currentStatus.equals(WorkOrderStatusEnum.COMPLETED.getCode())) {
            throw new BusinessException("工单已完成，无法继续流转");
        }

        LocalDateTime now = LocalDateTime.now();
        WorkOrderStatusEnum nextStatus = getNextStatus(currentStatus);

        updateStatusTimeFields(workOrder, currentStatus, now);
        workOrder.setStatus(nextStatus.getCode());

        dyeWorkOrderMapper.updateById(workOrder);
        clearWorkOrderCache(workOrderId);

        log.info("工单状态流转成功，工单号: {}, 从 {} 流转到 {}",
                workOrder.getOrderNo(), currentStatus, nextStatus.getCode());
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "工单管理", operation = "工单完工", description = "工单完工，核算成本")
    public CostDetailVO completeWorkOrder(WorkOrderCompleteDTO completeDTO) {
        DyeWorkOrder workOrder = dyeWorkOrderMapper.selectById(completeDTO.getWorkOrderId());
        if (workOrder == null) {
            throw new BusinessException("工单不存在");
        }
        if (!workOrder.getStatus().equals(WorkOrderStatusEnum.CUTTING.getCode())) {
            throw new BusinessException("当前状态不能完工，请先完成裁剪工序");
        }

        LambdaQueryWrapper<WorkOrderMaterial> materialQuery = new LambdaQueryWrapper<>();
        materialQuery.eq(WorkOrderMaterial::getWorkOrderId, completeDTO.getWorkOrderId());
        List<WorkOrderMaterial> materials = workOrderMaterialMapper.selectList(materialQuery);

        BigDecimal totalMaterialCost = BigDecimal.ZERO;
        BigDecimal fabricCost = BigDecimal.ZERO;
        BigDecimal dyeCost = BigDecimal.ZERO;

        for (WorkOrderMaterial material : materials) {
            if (material.getTotalPrice() != null) {
                totalMaterialCost = totalMaterialCost.add(material.getTotalPrice());
                if (material.getMaterialName() != null) {
                    if (material.getMaterialName().contains("布")
                            || material.getMaterialName().contains("坯")
                            || material.getMaterialName().contains("面料")) {
                        fabricCost = fabricCost.add(material.getTotalPrice());
                    } else if (material.getMaterialName().contains("染")
                            || material.getMaterialName().contains("料")) {
                        dyeCost = dyeCost.add(material.getTotalPrice());
                    }
                }
            }
        }

        BigDecimal laborHours = completeDTO.getLaborHours() != null
                ? completeDTO.getLaborHours() : BigDecimal.ZERO;
        BigDecimal laborCost = laborHours.multiply(new BigDecimal("50"));

        BigDecimal waterElectricityCost = completeDTO.getWaterElectricityCost() != null
                ? completeDTO.getWaterElectricityCost() : BigDecimal.ZERO;

        BigDecimal equipmentLoss = completeDTO.getEquipmentLoss() != null
                ? completeDTO.getEquipmentLoss() : BigDecimal.ZERO;

        BigDecimal otherCost = completeDTO.getOtherCost() != null
                ? completeDTO.getOtherCost() : BigDecimal.ZERO;

        BigDecimal totalCost = totalMaterialCost.add(laborCost)
                .add(waterElectricityCost).add(equipmentLoss).add(otherCost);

        BigDecimal unitCost = totalCost;
        if (workOrder.getFabricQuantity() != null
                && workOrder.getFabricQuantity().compareTo(BigDecimal.ZERO) > 0) {
            unitCost = totalCost.divide(workOrder.getFabricQuantity(), 2, RoundingMode.HALF_UP);
        }

        BigDecimal lossAmount = BigDecimal.ZERO;
        if (completeDTO.getMaterialLosses() != null) {
            for (var loss : completeDTO.getMaterialLosses()) {
                if (loss.getActualQuantity() != null && loss.getPlannedQuantity() != null) {
                    BigDecimal diff = loss.getActualQuantity().subtract(loss.getPlannedQuantity());
                    if (diff.compareTo(BigDecimal.ZERO) > 0) {
                        lossAmount = lossAmount.add(diff);
                    }
                }
            }
        }

        BigDecimal lossRate = BigDecimal.ZERO;
        if (totalMaterialCost.compareTo(BigDecimal.ZERO) > 0) {
            lossRate = lossAmount.divide(totalMaterialCost, 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"));
        }

        CostDetailVO costDetail = new CostDetailVO();
        costDetail.setFabricCost(fabricCost);
        costDetail.setDyeCost(dyeCost);
        costDetail.setLaborCost(laborCost);
        costDetail.setWaterElectricityCost(waterElectricityCost);
        costDetail.setEquipmentLoss(equipmentLoss);
        costDetail.setOtherCost(otherCost);
        costDetail.setTotalMaterialCost(totalMaterialCost);
        costDetail.setTotalCost(totalCost);
        costDetail.setUnitCost(unitCost);
        costDetail.setLossAmount(lossAmount);
        costDetail.setLossRate(lossRate);

        workOrder.setStatus(WorkOrderStatusEnum.COMPLETED.getCode());
        workOrder.setCompletedTime(LocalDateTime.now());
        dyeWorkOrderMapper.updateById(workOrder);

        costAccountingService.generateDailyReport(LocalDate.now());

        for (WorkOrderMaterial material : materials) {
            inventoryService.confirmDeduction(
                    material.getInventoryId(),
                    material.getQuantity(),
                    workOrder.getId()
            );
        }

        clearWorkOrderCache(workOrder.getId());
        log.info("工单完工成功，工单号: {}, 总成本: {}", workOrder.getOrderNo(), totalCost);

        return costDetail;
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "工单管理", operation = "暂停工单", description = "暂停染制工单")
    public void pauseWorkOrder(Long workOrderId) {
        DyeWorkOrder workOrder = dyeWorkOrderMapper.selectById(workOrderId);
        if (workOrder == null) {
            throw new BusinessException("工单不存在");
        }
        if (workOrder.getStatus().equals(WorkOrderStatusEnum.COMPLETED.getCode())) {
            throw new BusinessException("已完成工单无法暂停");
        }
        if (workOrder.getStatus().equals(WorkOrderStatusEnum.PAUSED.getCode())) {
            throw new BusinessException("工单已暂停");
        }

        workOrder.setStatus(WorkOrderStatusEnum.PAUSED.getCode());
        dyeWorkOrderMapper.updateById(workOrder);
        clearWorkOrderCache(workOrderId);

        log.info("工单暂停成功，工单号: {}", workOrder.getOrderNo());
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "工单管理", operation = "恢复工单", description = "恢复已暂停的工单")
    public void resumeWorkOrder(Long workOrderId) {
        DyeWorkOrder workOrder = dyeWorkOrderMapper.selectById(workOrderId);
        if (workOrder == null) {
            throw new BusinessException("工单不存在");
        }
        if (!workOrder.getStatus().equals(WorkOrderStatusEnum.PAUSED.getCode())) {
            throw new BusinessException("只有暂停状态的工单可以恢复");
        }

        WorkOrderStatusEnum resumeStatus = determineResumeStatus(workOrder);
        workOrder.setStatus(resumeStatus.getCode());
        dyeWorkOrderMapper.updateById(workOrder);
        clearWorkOrderCache(workOrderId);

        log.info("工单恢复成功，工单号: {}, 恢复到状态: {}", workOrder.getOrderNo(), resumeStatus.getDesc());
    }

    public Page<DyeWorkOrder> getWorkOrderPage(Integer pageNum, Integer pageSize, Integer status,
                                                Long categoryId, Long assignedUserId) {
        Page<DyeWorkOrder> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<DyeWorkOrder> queryWrapper = new LambdaQueryWrapper<>();
        if (status != null) {
            queryWrapper.eq(DyeWorkOrder::getStatus, status);
        }
        if (categoryId != null) {
            queryWrapper.eq(DyeWorkOrder::getCategoryId, categoryId);
        }
        if (assignedUserId != null) {
            queryWrapper.eq(DyeWorkOrder::getAssignedUserId, assignedUserId);
        }
        queryWrapper.orderByDesc(DyeWorkOrder::getCreateTime);
        return dyeWorkOrderMapper.selectPage(page, queryWrapper);
    }

    public WorkOrderDetailVO getWorkOrderDetail(Long id) {
        String cacheKey = WORK_ORDER_CACHE_KEY + id;
        try {
            Object cacheData = redisUtil.get(cacheKey);
            if (cacheData != null) {
                return objectMapper.convertValue(cacheData, WorkOrderDetailVO.class);
            }
        } catch (Exception e) {
            log.warn("获取工单缓存失败: {}", e.getMessage());
        }

        DyeWorkOrder workOrder = dyeWorkOrderMapper.selectById(id);
        if (workOrder == null) {
            return null;
        }

        WorkOrderDetailVO detailVO = new WorkOrderDetailVO();
        BeanUtils.copyProperties(workOrder, detailVO);

        WorkOrderStatusEnum statusEnum = WorkOrderStatusEnum.fromCode(workOrder.getStatus());
        detailVO.setStatusDesc(statusEnum != null ? statusEnum.getDesc() : "未知");

        if (workOrder.getCategoryId() != null) {
            ColorCategory category = colorCategoryService.getCategoryById(workOrder.getCategoryId());
            if (category != null) {
                detailVO.setCategoryName(category.getCategoryName());
            }
        }

        LambdaQueryWrapper<WorkOrderMaterial> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(WorkOrderMaterial::getWorkOrderId, id);
        List<WorkOrderMaterial> materials = workOrderMaterialMapper.selectList(queryWrapper);

        List<WorkOrderMaterialVO> materialVOList = materials.stream()
                .map(m -> {
                    WorkOrderMaterialVO vo = new WorkOrderMaterialVO();
                    BeanUtils.copyProperties(m, vo);
                    return vo;
                })
                .collect(Collectors.toList());
        detailVO.setMaterials(materialVOList);

        try {
            redisUtil.set(cacheKey, detailVO, 30, java.util.concurrent.TimeUnit.MINUTES);
        } catch (Exception e) {
            log.warn("工单缓存写入失败: {}", e.getMessage());
        }

        return detailVO;
    }

    public List<WorkOrderMaterial> getWorkOrderMaterials(Long workOrderId) {
        LambdaQueryWrapper<WorkOrderMaterial> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(WorkOrderMaterial::getWorkOrderId, workOrderId);
        return workOrderMaterialMapper.selectList(queryWrapper);
    }

    public Map<String, Long> getWorkOrderStatistics() {
        List<DyeWorkOrder> allOrders = dyeWorkOrderMapper.selectList(null);
        return allOrders.stream()
                .collect(Collectors.groupingBy(
                        order -> {
                            WorkOrderStatusEnum status = WorkOrderStatusEnum.fromCode(order.getStatus());
                            return status != null ? status.getDesc() : "未知";
                        },
                        Collectors.counting()
                ));
    }

    private String generateOrderNo() {
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        LambdaQueryWrapper<DyeWorkOrder> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.like(DyeWorkOrder::getOrderNo, "WO-" + date);
        Long count = dyeWorkOrderMapper.selectCount(queryWrapper);
        return String.format("WO-%s-%04d", date, count + 1);
    }

    public void checkAndPauseOverdueOrders() {
        LocalDateTime threshold = LocalDateTime.now().minusHours(24);
        LambdaQueryWrapper<DyeWorkOrder> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(DyeWorkOrder::getStatus, WorkOrderStatusEnum.PENDING.getCode())
                .lt(DyeWorkOrder::getCreateTime, threshold);

        List<DyeWorkOrder> overdueOrders = dyeWorkOrderMapper.selectList(queryWrapper);
        for (DyeWorkOrder order : overdueOrders) {
            order.setStatus(WorkOrderStatusEnum.PAUSED.getCode());
            dyeWorkOrderMapper.updateById(order);
            log.info("超时工单已暂停: {}", order.getOrderNo());
        }
    }

    private void calculateMaterialTotalPrice(WorkOrderMaterial material) {
        if (material.getQuantity() != null && material.getUnitPrice() != null) {
            material.setTotalPrice(material.getQuantity().multiply(material.getUnitPrice()));
        }
    }

    private WorkOrderStatusEnum getNextStatus(Integer currentStatusCode) {
        WorkOrderStatusEnum currentStatus = WorkOrderStatusEnum.fromCode(currentStatusCode);
        if (currentStatus == null) {
            throw new BusinessException("未知的工单状态");
        }
        switch (currentStatus) {
            case PENDING:
                return WorkOrderStatusEnum.PREPROCESSING;
            case PREPROCESSING:
                return WorkOrderStatusEnum.BOILING;
            case BOILING:
                return WorkOrderStatusEnum.DYEING;
            case DYEING:
                return WorkOrderStatusEnum.FIXING;
            case FIXING:
                return WorkOrderStatusEnum.DRYING;
            case DRYING:
                return WorkOrderStatusEnum.CUTTING;
            case CUTTING:
                return WorkOrderStatusEnum.COMPLETED;
            default:
                throw new BusinessException("当前状态无法流转: " + currentStatus.getDesc());
        }
    }

    private void updateStatusTimeFields(DyeWorkOrder workOrder, Integer currentStatusCode, LocalDateTime now) {
        WorkOrderStatusEnum currentStatus = WorkOrderStatusEnum.fromCode(currentStatusCode);
        if (currentStatus == null) {
            return;
        }
        switch (currentStatus) {
            case PREPROCESSING:
                workOrder.setPreprocessFinishTime(now);
                break;
            case BOILING:
                workOrder.setBoilingFinishTime(now);
                break;
            case DYEING:
                workOrder.setDyeingFinishTime(now);
                break;
            case FIXING:
                workOrder.setFixingFinishTime(now);
                break;
            case DRYING:
                workOrder.setDryingFinishTime(now);
                break;
            case CUTTING:
                workOrder.setCuttingFinishTime(now);
                break;
        }
    }

    private WorkOrderStatusEnum determineResumeStatus(DyeWorkOrder workOrder) {
        if (workOrder.getFeedingTime() == null) {
            return WorkOrderStatusEnum.PENDING;
        }
        if (workOrder.getPreprocessFinishTime() == null) {
            return WorkOrderStatusEnum.PREPROCESSING;
        }
        if (workOrder.getBoilingFinishTime() == null) {
            return WorkOrderStatusEnum.BOILING;
        }
        if (workOrder.getDyeingFinishTime() == null) {
            return WorkOrderStatusEnum.DYEING;
        }
        if (workOrder.getFixingFinishTime() == null) {
            return WorkOrderStatusEnum.FIXING;
        }
        if (workOrder.getDryingFinishTime() == null) {
            return WorkOrderStatusEnum.DRYING;
        }
        if (workOrder.getCuttingFinishTime() == null) {
            return WorkOrderStatusEnum.CUTTING;
        }
        return WorkOrderStatusEnum.COMPLETED;
    }

    private void clearWorkOrderCache(Long id) {
        try {
            if (id != null) {
                redisUtil.delete(WORK_ORDER_CACHE_KEY + id);
            }
        } catch (Exception e) {
            log.warn("清除工单缓存失败: {}", e.getMessage());
        }
    }
}
