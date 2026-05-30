package com.bearing.production.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.bearing.production.dto.CostCalculationDTO;
import com.bearing.production.dto.WorkOrderDTO;
import com.bearing.production.dto.WorkOrderStartDTO;
import com.bearing.production.entity.BearingCategory;
import com.bearing.production.entity.Material;
import com.bearing.production.entity.ProductionWaste;
import com.bearing.production.entity.WorkOrder;
import com.bearing.production.enums.WorkOrderStatusEnum;
import com.bearing.production.exception.BusinessException;
import com.bearing.production.mapper.WorkOrderMapper;
import com.bearing.production.util.RedisUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class WorkOrderService {

    private final WorkOrderMapper workOrderMapper;
    private final BearingCategoryService categoryService;
    private final MaterialService materialService;
    private final ProductionWasteService productionWasteService;
    private final RedisUtil redisUtil;

    private static final String WORK_ORDER_KEY = "bearing:workorder:";

    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = "workOrderCache", allEntries = true)
    public void createWorkOrder(WorkOrderDTO dto) {
        if (!categoryService.isCategoryActive(dto.getCategoryId())) {
            throw new BusinessException("该品类已下线，无法创建工单");
        }

        dto.validateTime();

        WorkOrder workOrder = convertToEntity(dto);
        String orderNo = generateOrderNo();
        workOrder.setOrderNo(orderNo);
        workOrder.setStatus(WorkOrderStatusEnum.CREATED.getCode());

        workOrderMapper.insert(workOrder);
        log.info("【工单创建】工单编号: {}, 品类: {}, 数量: {}", orderNo, dto.getCategoryName(), dto.getQuantity());
    }

    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = "workOrderCache", allEntries = true)
    public void startWorkOrder(WorkOrderStartDTO dto) {
        WorkOrder workOrder = getWorkOrder(dto.getWorkOrderId());

        if (workOrder.getStatus() != WorkOrderStatusEnum.CREATED.getCode()) {
            throw new BusinessException("工单状态不正确，当前状态: " + getStatusName(workOrder.getStatus()));
        }

        if (!categoryService.isCategoryActive(workOrder.getCategoryId())) {
            throw new BusinessException("该品类已下线，无法投产");
        }

        Material material = materialService.getById(dto.getMaterialId());
        materialService.lockMaterialStock(dto.getMaterialId(), dto.getMaterialQuantity(), dto.getWorkOrderId());

        if (dto.getProcessEngineer() != null) {
            workOrder.setProcessEngineer(dto.getProcessEngineer());
        }
        if (dto.getLineLeader() != null) {
            workOrder.setLineLeader(dto.getLineLeader());
        }
        if (dto.getRemark() != null) {
            workOrder.setRemark(dto.getRemark());
        }

        workOrder.setMaterialId(dto.getMaterialId());
        workOrder.setMaterialName(material.getMaterialName());
        workOrder.setMaterialQuantity(dto.getMaterialQuantity());
        workOrder.setStatus(WorkOrderStatusEnum.PENDING.getCode());
        workOrder.setActualStartTime(LocalDateTime.now());

        workOrderMapper.updateById(workOrder);
        clearWorkOrderCache(dto.getWorkOrderId());

        log.info("【工单投产】工单编号: {}, 原料: {}, 锁定数量: {}", workOrder.getOrderNo(), material.getMaterialName(), dto.getMaterialQuantity());
    }

    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = "workOrderCache", allEntries = true)
    public void processStatus(Long id, Integer targetStatus, BigDecimal materialUsage, BigDecimal equipmentLoss,
                              BigDecimal energyCost, BigDecimal laborHours, BigDecimal defectiveQuantity, BigDecimal defectiveLoss) {
        WorkOrder workOrder = getWorkOrder(id);

        if (targetStatus == null || WorkOrderStatusEnum.getByCode(targetStatus) == null) {
            throw new BusinessException("目标状态无效");
        }

        validateStatusTransition(workOrder.getStatus(), targetStatus);

        if (materialUsage != null) {
            workOrder.setMaterialUsage(materialUsage);
        }
        if (equipmentLoss != null) {
            workOrder.setEquipmentLoss(equipmentLoss);
        }
        if (energyCost != null) {
            workOrder.setEnergyCost(energyCost);
        }
        if (laborHours != null) {
            workOrder.setLaborHours(laborHours);
        }
        if (defectiveQuantity != null) {
            workOrder.setDefectiveQuantity(defectiveQuantity);
        }
        if (defectiveLoss != null) {
            workOrder.setDefectiveLoss(defectiveLoss);
        }

        workOrder.setStatus(targetStatus);
        
        if (targetStatus == WorkOrderStatusEnum.FINISHED.getCode()) {
            workOrder.setActualEndTime(LocalDateTime.now());
            calculateTotalCost(workOrder);
            calculateYieldRate(workOrder);
            
            if (workOrder.getMaterialId() != null && workOrder.getMaterialQuantity() != null) {
                materialService.consumeMaterialStock(workOrder.getMaterialId(), workOrder.getMaterialQuantity(), id);
            }
        }

        workOrderMapper.updateById(workOrder);
        clearWorkOrderCache(id);
        
        log.info("【状态流转】工单编号: {}, 流转为: {}", workOrder.getOrderNo(), getStatusName(targetStatus));
    }

    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = "workOrderCache", allEntries = true)
    public void nextStatus(Long id) {
        WorkOrder workOrder = getWorkOrder(id);
        WorkOrderStatusEnum nextStatus = WorkOrderStatusEnum.getNextStatus(workOrder.getStatus());

        if (nextStatus == null) {
            throw new BusinessException("工单已完成或已取消，无法继续流转");
        }

        if (nextStatus == WorkOrderStatusEnum.FINISHED) {
            workOrder.setActualEndTime(LocalDateTime.now());
            calculateTotalCost(workOrder);
            calculateYieldRate(workOrder);
            
            if (workOrder.getMaterialId() != null && workOrder.getMaterialQuantity() != null) {
                materialService.consumeMaterialStock(workOrder.getMaterialId(), workOrder.getMaterialQuantity(), id);
            }
        }

        workOrder.setStatus(nextStatus.getCode());
        workOrderMapper.updateById(workOrder);
        clearWorkOrderCache(id);

        log.info("【自动流转】工单编号: {}, 流转为: {}", workOrder.getOrderNo(), nextStatus.getName());
    }

    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = {"workOrderCache", "wasteCache"}, allEntries = true)
    public ProductionWaste completeWorkOrder(CostCalculationDTO dto) {
        WorkOrder workOrder = getWorkOrder(dto.getWorkOrderId());

        if (workOrder.getStatus() != WorkOrderStatusEnum.GRINDING.getCode()) {
            throw new BusinessException("工单未到达完成前的最后工序，当前状态: " + getStatusName(workOrder.getStatus()));
        }

        workOrder.setActualEndTime(LocalDateTime.now());
        
        workOrder.setMaterialUsage(dto.getMaterialWaste());
        workOrder.setEquipmentLoss(dto.getEquipmentWear());
        workOrder.setEnergyCost(dto.getEnergyCost());
        workOrder.setLaborCost(dto.getLaborCost());
        workOrder.setDefectiveQuantity(dto.getDefectiveQuantity());
        workOrder.setDefectiveLoss(dto.getDefectiveLoss());
        
        if (dto.getQualityInspector() != null) {
            workOrder.setQualityInspector(dto.getQualityInspector());
        }
        
        calculateTotalCost(workOrder);
        calculateYieldRate(workOrder);
        
        workOrder.setStatus(WorkOrderStatusEnum.FINISHED.getCode());
        
        workOrder.setProductionQuantity(workOrder.getQuantity());
        BigDecimal qualifiedQuantity = workOrder.getQuantity().subtract(
                dto.getDefectiveQuantity() != null ? dto.getDefectiveQuantity() : BigDecimal.ZERO
        );
        if (qualifiedQuantity.compareTo(BigDecimal.ZERO) < 0) {
            qualifiedQuantity = BigDecimal.ZERO;
        }
        workOrder.setQualifiedQuantity(qualifiedQuantity);
        
        if (workOrder.getMaterialId() != null && workOrder.getMaterialQuantity() != null) {
            materialService.consumeMaterialStock(workOrder.getMaterialId(), workOrder.getMaterialQuantity(), dto.getWorkOrderId());
        }
        
        workOrderMapper.updateById(workOrder);
        clearWorkOrderCache(dto.getWorkOrderId());
        
        ProductionWaste waste = productionWasteService.createProductionWaste(
                dto, workOrder.getOrderNo(), workOrder.getCategoryId(), workOrder.getCategoryName(),
                workOrder.getMaterialId(), workOrder.getMaterialName(), workOrder.getQuantity()
        );
        
        log.info("【工单完工】工单编号: {}, 总成本: {}, 良品率: {}%", workOrder.getOrderNo(), workOrder.getTotalCost(), workOrder.getYieldRate());
        return waste;
    }

    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = "workOrderCache", allEntries = true)
    public void updateDefectiveData(Long id, BigDecimal defectiveQuantity, BigDecimal defectiveLoss, String qualityInspector) {
        WorkOrder workOrder = getWorkOrder(id);
        
        if (defectiveQuantity != null) {
            workOrder.setDefectiveQuantity(defectiveQuantity);
        }
        if (defectiveLoss != null) {
            workOrder.setDefectiveLoss(defectiveLoss);
        }
        if (qualityInspector != null) {
            workOrder.setQualityInspector(qualityInspector);
        }
        
        calculateYieldRate(workOrder);
        workOrderMapper.updateById(workOrder);
        clearWorkOrderCache(id);
        
        log.info("【次品更新】工单编号: {}, 次品数量: {}, 次品损失: {}", workOrder.getOrderNo(), defectiveQuantity, defectiveLoss);
    }

    private void calculateTotalCost(WorkOrder workOrder) {
        BigDecimal totalCost = BigDecimal.ZERO;

        if (workOrder.getMaterialUsage() != null) {
            totalCost = totalCost.add(workOrder.getMaterialUsage());
        }
        if (workOrder.getEquipmentLoss() != null) {
            totalCost = totalCost.add(workOrder.getEquipmentLoss());
        }
        if (workOrder.getEnergyCost() != null) {
            totalCost = totalCost.add(workOrder.getEnergyCost());
        }
        if (workOrder.getLaborCost() != null) {
            totalCost = totalCost.add(workOrder.getLaborCost());
        }
        if (workOrder.getDefectiveLoss() != null) {
            totalCost = totalCost.add(workOrder.getDefectiveLoss());
        }

        workOrder.setTotalCost(totalCost);
        
        BigDecimal qualifiedQuantity = workOrder.getQualifiedQuantity();
        if (qualifiedQuantity == null && workOrder.getQuantity() != null && workOrder.getDefectiveQuantity() != null) {
            qualifiedQuantity = workOrder.getQuantity().subtract(workOrder.getDefectiveQuantity());
            if (qualifiedQuantity.compareTo(BigDecimal.ZERO) < 0) {
                qualifiedQuantity = BigDecimal.ZERO;
            }
            workOrder.setQualifiedQuantity(qualifiedQuantity);
        }
        
        if (qualifiedQuantity != null && qualifiedQuantity.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal unitCost = totalCost.divide(qualifiedQuantity, 4, RoundingMode.HALF_UP);
            workOrder.setUnitCost(unitCost);
        } else {
            workOrder.setUnitCost(BigDecimal.ZERO);
        }
    }

    private void calculateYieldRate(WorkOrder workOrder) {
        if (workOrder.getQuantity() == null || workOrder.getQuantity().compareTo(BigDecimal.ZERO) == 0) {
            workOrder.setYieldRate(BigDecimal.ZERO);
            return;
        }

        BigDecimal defective = workOrder.getDefectiveQuantity() != null ? workOrder.getDefectiveQuantity() : BigDecimal.ZERO;
        BigDecimal qualified = workOrder.getQuantity().subtract(defective);
        
        if (qualified.compareTo(BigDecimal.ZERO) < 0) {
            qualified = BigDecimal.ZERO;
        }
        
        workOrder.setQualifiedQuantity(qualified);
        
        BigDecimal yieldRate = qualified
                .divide(workOrder.getQuantity(), 4, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"));
        workOrder.setYieldRate(yieldRate);
    }

    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = "workOrderCache", allEntries = true)
    public void suspendWorkOrder(Long id, String reason) {
        WorkOrder workOrder = getWorkOrder(id);
        
        if (workOrder.getStatus() >= WorkOrderStatusEnum.FINISHED.getCode()) {
            throw new BusinessException("已完成工单不能暂停");
        }
        
        workOrder.setStatus(WorkOrderStatusEnum.SUSPENDED.getCode());
        String remark = workOrder.getRemark() == null ? "" : workOrder.getRemark();
        workOrder.setRemark(remark + " [暂停原因: " + reason + "]");
        
        if (workOrder.getMaterialId() != null && workOrder.getMaterialQuantity() != null) {
            materialService.unlockMaterialStock(workOrder.getMaterialId(), workOrder.getMaterialQuantity(), id);
        }
        
        workOrderMapper.updateById(workOrder);
        clearWorkOrderCache(id);
        
        log.info("【工单暂停】工单编号: {}, 原因: {}", workOrder.getOrderNo(), reason);
    }

    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = "workOrderCache", allEntries = true)
    public void resumeWorkOrder(Long id) {
        WorkOrder workOrder = getWorkOrder(id);
        
        if (workOrder.getStatus() != WorkOrderStatusEnum.SUSPENDED.getCode()) {
            throw new BusinessException("工单不是暂停状态，无法恢复");
        }
        
        if (!categoryService.isCategoryActive(workOrder.getCategoryId())) {
            throw new BusinessException("该品类已下线，无法恢复生产");
        }

        if (workOrder.getMaterialId() != null && workOrder.getMaterialQuantity() != null) {
            materialService.lockMaterialStock(workOrder.getMaterialId(), workOrder.getMaterialQuantity(), id);
        }

        workOrder.setStatus(WorkOrderStatusEnum.PENDING.getCode());
        workOrderMapper.updateById(workOrder);
        clearWorkOrderCache(id);
        
        log.info("【工单恢复】工单编号: {}", workOrder.getOrderNo());
    }

    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = "workOrderCache", allEntries = true)
    public void cancelWorkOrder(Long id, String reason) {
        WorkOrder workOrder = getWorkOrder(id);
        
        if (workOrder.getStatus() >= WorkOrderStatusEnum.CUTTING.getCode()) {
            throw new BusinessException("工单已开始生产，无法取消");
        }
        
        workOrder.setStatus(WorkOrderStatusEnum.CANCELLED.getCode());
        String remark = workOrder.getRemark() == null ? "" : workOrder.getRemark();
        workOrder.setRemark(remark + " [取消原因: " + reason + "]");
        
        if (workOrder.getMaterialId() != null && workOrder.getMaterialQuantity() != null) {
            materialService.unlockMaterialStock(workOrder.getMaterialId(), workOrder.getMaterialQuantity(), id);
        }
        
        workOrderMapper.updateById(workOrder);
        clearWorkOrderCache(id);
        
        log.info("【工单取消】工单编号: {}, 原因: {}", workOrder.getOrderNo(), reason);
    }

    public WorkOrder getById(Long id) {
        String cacheKey = WORK_ORDER_KEY + id;
        
        if (redisUtil.hasKey(cacheKey)) {
            return (WorkOrder) redisUtil.get(cacheKey);
        }
        
        WorkOrder workOrder = getWorkOrder(id);
        redisUtil.set(cacheKey, workOrder, 1, TimeUnit.HOURS);
        return workOrder;
    }

    @Cacheable(value = "workOrderCache", key = "'list:' + #status + ':' + #page + ':' + #size")
    public IPage<WorkOrder> getByStatusPage(Integer status, int page, int size) {
        LambdaQueryWrapper<WorkOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(status != null, WorkOrder::getStatus, status);
        wrapper.orderByDesc(WorkOrder::getCreateTime);
        return workOrderMapper.selectPage(new Page<>(page, size), wrapper);
    }

    public List<WorkOrder> getByStatus(Integer status) {
        LambdaQueryWrapper<WorkOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(status != null, WorkOrder::getStatus, status);
        wrapper.orderByDesc(WorkOrder::getCreateTime);
        return workOrderMapper.selectList(wrapper);
    }

    public List<WorkOrder> getExpiredPendingOrders() {
        LambdaQueryWrapper<WorkOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(WorkOrder::getStatus, WorkOrderStatusEnum.CREATED.getCode())
                .lt(WorkOrder::getPlanStartTime, LocalDateTime.now());
        return workOrderMapper.selectList(wrapper);
    }

    public String getStatusName(Integer status) {
        return WorkOrderStatusEnum.getStatusName(status);
    }

    private WorkOrder getWorkOrder(Long id) {
        WorkOrder workOrder = workOrderMapper.selectById(id);
        if (workOrder == null) {
            throw new BusinessException("工单不存在，ID: " + id);
        }
        return workOrder;
    }

    private void validateStatusTransition(Integer currentStatus, Integer targetStatus) {
        if (!isValidTransition(currentStatus, targetStatus)) {
            throw new BusinessException(
                String.format("不能从 %s 状态流转到 %s 状态", 
                    getStatusName(currentStatus), 
                    getStatusName(targetStatus))
            );
        }
    }

    private boolean isValidTransition(Integer currentStatus, Integer targetStatus) {
        WorkOrderStatusEnum current = WorkOrderStatusEnum.getNextStatus(currentStatus);
        return current != null && current.getCode().equals(targetStatus);
    }

    private String generateOrderNo() {
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));

        LambdaQueryWrapper<WorkOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.likeRight(WorkOrder::getOrderNo, "WO" + dateStr);
        Long count = workOrderMapper.selectCount(wrapper);

        return "WO" + dateStr + String.format("%04d", count + 1);
    }

    private WorkOrder convertToEntity(WorkOrderDTO dto) {
        WorkOrder workOrder = new WorkOrder();
        workOrder.setCategoryId(dto.getCategoryId());
        workOrder.setCategoryName(dto.getCategoryName());
        workOrder.setQuantity(dto.getQuantity());
        workOrder.setPlanStartTime(dto.getPlanStartTime());
        workOrder.setPlanEndTime(dto.getPlanEndTime());
        workOrder.setMaterialId(dto.getMaterialId());
        workOrder.setMaterialName(dto.getMaterialName());
        workOrder.setProcessEngineer(dto.getProcessEngineer());
        workOrder.setLineLeader(dto.getLineLeader());
        workOrder.setQualityInspector(dto.getQualityInspector());
        workOrder.setRemark(dto.getRemark());
        return workOrder;
    }

    private void clearWorkOrderCache(Long id) {
        redisUtil.delete(WORK_ORDER_KEY + id);
        redisUtil.deleteByPrefix("workOrderCache:");
    }
}
