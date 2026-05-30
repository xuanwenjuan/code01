package com.flange.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.flange.annotation.RequiresRole;
import com.flange.common.RoleConstants;
import com.flange.dto.ProductionLossDto;
import com.flange.dto.ProductionOrderDto;
import com.flange.dto.QualityInspectionDto;
import com.flange.entity.*;
import com.flange.exception.BusinessException;
import com.flange.mapper.*;
import com.flange.util.BatchNoGenerator;
import com.flange.util.CacheUtil;
import com.flange.util.UserContext;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class ProductionOrderService {

    private final ProductionOrderMapper orderMapper;
    private final FlangeCategoryMapper categoryMapper;
    private final MaterialStorageMapper materialMapper;
    private final MaterialLockMapper materialLockMapper;
    private final CostAccountingMapper costMapper;
    private final QualityInspectionMapper inspectionMapper;
    private final WorkHoursMapper workHoursMapper;
    private final ProductionLossMapper productionLossMapper;
    private final MaterialStorageService materialService;
    private final CacheUtil cacheUtil;

    private static final String CACHE_ORDER_PREFIX = "order:";
    private static final List<String> PROCESS_STEPS = Arrays.asList(
            "CUTTING", "ROUGH_TURNING", "FINE_TURNING", "MILLING",
            "WELDING", "NON_DESTRUCTIVE", "RUST_PROOF", "FINISHED"
    );

    @SuppressWarnings("unchecked")
    public IPage<ProductionOrder> getOrderPage(int page, int size, String status, Long categoryId) {
        String cacheKey = CACHE_ORDER_PREFIX + "page:" + page + ":" + size + ":" + status + ":" + categoryId;
        Object cached = cacheUtil.get(cacheKey);
        if (cached != null) {
            return (IPage<ProductionOrder>) cached;
        }

        LambdaQueryWrapper<ProductionOrder> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(status)) {
            wrapper.eq(ProductionOrder::getStatus, status);
        }
        if (categoryId != null) {
            wrapper.eq(ProductionOrder::getCategoryId, categoryId);
        }
        wrapper.orderByDesc(ProductionOrder::getCreateTime);
        IPage<ProductionOrder> result = orderMapper.selectPage(new Page<>(page, size), wrapper);
        cacheUtil.set(cacheKey, result, 5, TimeUnit.MINUTES);
        return result;
    }

    @SuppressWarnings("unchecked")
    public ProductionOrder getOrderById(Long id) {
        String cacheKey = CACHE_ORDER_PREFIX + id;
        Object cached = cacheUtil.get(cacheKey);
        if (cached != null) {
            return (ProductionOrder) cached;
        }

        ProductionOrder order = orderMapper.selectById(id);
        if (order != null) {
            cacheUtil.set(cacheKey, order, 10, TimeUnit.MINUTES);
        }
        return order;
    }

    @Transactional(rollbackFor = Exception.class)
    @RequiresRole({RoleConstants.PROCESS_ENGINEER, RoleConstants.ADMIN})
    public void createOrder(ProductionOrderDto dto) {
        validateOrderDto(dto);

        FlangeCategory category = categoryMapper.selectById(dto.getCategoryId());
        if (category == null) {
            throw new BusinessException("法兰分类不存在");
        }

        MaterialStorage material = materialMapper.selectById(dto.getMaterialId());
        if (material == null) {
            throw new BusinessException("原料不存在");
        }

        BigDecimal requiredMaterial = dto.getRequiredMaterial() != null ?
                dto.getRequiredMaterial() : calculateRequiredMaterial(dto.getQuantity());
        BigDecimal availableQuantity = materialService.getAvailableQuantity(dto.getMaterialId());
        if (availableQuantity.compareTo(requiredMaterial) < 0) {
            throw new BusinessException("可用库存不足，需要：" + requiredMaterial + "，当前可用：" + availableQuantity);
        }

        ProductionOrder order = new ProductionOrder();
        BeanUtils.copyProperties(dto, order);
        order.setOrderNo(BatchNoGenerator.generateBatchNo("PO"));
        order.setCategoryName(category.getCategoryName());
        order.setMaterialName(material.getMaterialName());
        order.setRequiredMaterial(requiredMaterial);
        order.setUnitPrice(material.getUnitPrice());
        order.setStatus("PENDING");
        order.setProcessStatus("CUTTING");
        order.setActualQuantity(0);
        order.setRejectionQuantity(0);
        order.setCreateBy(UserContext.getUserId());
        orderMapper.insert(order);

        materialService.lockMaterial(dto.getMaterialId(), order.getId(), order.getOrderNo(),
                requiredMaterial, "工单创建自动锁定");

        initCostAccounting(order.getId(), order.getOrderNo(), dto.getMaterialId(),
                material.getMaterialName(), requiredMaterial, material.getUnitPrice());

        clearOrderCache();
    }

    private void validateOrderDto(ProductionOrderDto dto) {
        if (dto.getCategoryId() == null) {
            throw new BusinessException("法兰分类不能为空");
        }
        if (dto.getMaterialId() == null) {
            throw new BusinessException("原料不能为空");
        }
        if (dto.getQuantity() == null || dto.getQuantity() <= 0) {
            throw new BusinessException("生产数量必须大于0");
        }
        if (dto.getPlanStartDate() == null) {
            throw new BusinessException("计划开始日期不能为空");
        }
        if (dto.getPlanEndDate() == null) {
            throw new BusinessException("计划结束日期不能为空");
        }
        if (dto.getPlanEndDate().isBefore(dto.getPlanStartDate())) {
            throw new BusinessException("计划结束日期不能早于开始日期");
        }
    }

    private BigDecimal calculateRequiredMaterial(Integer quantity) {
        return new BigDecimal(quantity).multiply(new BigDecimal("0.5"));
    }

    private void initCostAccounting(Long orderId, String orderNo, Long materialId,
                                    String materialName, BigDecimal requiredMaterial, BigDecimal unitPrice) {
        CostAccounting cost = new CostAccounting();
        cost.setOrderId(orderId);
        cost.setOrderNo(orderNo);
        cost.setMaterialId(materialId);
        cost.setMaterialName(materialName);
        cost.setMaterialQuantity(requiredMaterial);
        cost.setMaterialCost(requiredMaterial.multiply(unitPrice));
        cost.setToolCost(BigDecimal.ZERO);
        cost.setEnergyCost(BigDecimal.ZERO);
        cost.setLaborCost(BigDecimal.ZERO);
        cost.setScrapCost(BigDecimal.ZERO);
        cost.setLaborHours(BigDecimal.ZERO);
        cost.setMachineHours(BigDecimal.ZERO);
        cost.setStatus("DRAFT");
        costMapper.insert(cost);
    }

    @Transactional(rollbackFor = Exception.class)
    @RequiresRole({RoleConstants.LINE_LEADER, RoleConstants.ADMIN})
    public void confirmMaterial(Long orderId, String remark) {
        ProductionOrder order = orderMapper.selectById(orderId);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (!"PENDING".equals(order.getStatus())) {
            throw new BusinessException("当前状态不允许备料确认");
        }

        LambdaQueryWrapper<MaterialLock> lockWrapper = new LambdaQueryWrapper<>();
        lockWrapper.eq(MaterialLock::getOrderId, orderId)
                   .eq(MaterialLock::getStatus, "ACTIVE");
        List<MaterialLock> locks = materialLockMapper.selectList(lockWrapper);

        for (MaterialLock lock : locks) {
            materialService.confirmLockUsage(lock.getId());
        }

        order.setStatus("MATERIAL_CONFIRMED");
        order.setRemark(remark);
        orderMapper.updateById(order);

        clearOrderCache();
    }

    @Transactional(rollbackFor = Exception.class)
    @RequiresRole({RoleConstants.LINE_LEADER, RoleConstants.ADMIN})
    public void startProduction(Long orderId) {
        ProductionOrder order = orderMapper.selectById(orderId);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (!"MATERIAL_CONFIRMED".equals(order.getStatus())) {
            throw new BusinessException("请先完成备料确认");
        }

        order.setStatus("PRODUCING");
        order.setActualStartDate(LocalDateTime.now());
        orderMapper.updateById(order);

        clearOrderCache();
    }

    @Transactional(rollbackFor = Exception.class)
    @RequiresRole({RoleConstants.LINE_LEADER, RoleConstants.ADMIN})
    public void completeProcess(Long orderId, Integer qualifiedQuantity,
                                Integer scrapQuantity, BigDecimal laborHours, BigDecimal machineHours, String remark) {
        ProductionOrder order = orderMapper.selectById(orderId);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (!"PRODUCING".equals(order.getStatus())) {
            throw new BusinessException("当前状态不允许完成工序");
        }

        String currentProcess = order.getProcessStatus();
        int currentIndex = PROCESS_STEPS.indexOf(currentProcess);
        if (currentIndex == -1 || currentIndex >= PROCESS_STEPS.size() - 1) {
            throw new BusinessException("工序状态异常");
        }

        if (qualifiedQuantity == null || qualifiedQuantity < 0) {
            qualifiedQuantity = 0;
        }
        if (scrapQuantity == null || scrapQuantity < 0) {
            scrapQuantity = 0;
        }
        if (laborHours == null || laborHours.compareTo(BigDecimal.ZERO) < 0) {
            laborHours = BigDecimal.ZERO;
        }
        if (machineHours == null || machineHours.compareTo(BigDecimal.ZERO) < 0) {
            machineHours = BigDecimal.ZERO;
        }

        order.setActualQuantity(order.getActualQuantity() + qualifiedQuantity);
        order.setRejectionQuantity(order.getRejectionQuantity() + scrapQuantity);
        String nextProcess = PROCESS_STEPS.get(currentIndex + 1);
        order.setProcessStatus(nextProcess);

        if ("FINISHED".equals(nextProcess)) {
            order.setStatus("WAITING_INSPECTION");
        }
        orderMapper.updateById(order);

        recordWorkHours(orderId, order.getOrderNo(), currentProcess, laborHours, machineHours);

        updateCostAccounting(orderId, laborHours, machineHours, scrapQuantity, order.getUnitPrice());

        if (scrapQuantity > 0 && order.getUnitPrice() != null) {
            ProductionLoss loss = new ProductionLoss();
            loss.setOrderId(orderId);
            loss.setOrderNo(order.getOrderNo());
            loss.setProcessStep(currentProcess);
            loss.setLossType("SCRAP");
            loss.setLossQuantity(new BigDecimal(scrapQuantity));
            loss.setUnitPrice(order.getUnitPrice());
            loss.setTotalPrice(new BigDecimal(scrapQuantity).multiply(order.getUnitPrice()));
            loss.setLossReason(remark);
            loss.setOperatorId(UserContext.getUserId());
            loss.setOperatorName(UserContext.getUsername());
            productionLossMapper.insert(loss);
        }

        clearOrderCache();
    }

    private void recordWorkHours(Long orderId, String orderNo, String processStep,
                                 BigDecimal laborHours, BigDecimal machineHours) {
        if (laborHours.compareTo(BigDecimal.ZERO) > 0 || machineHours.compareTo(BigDecimal.ZERO) > 0) {
            WorkHours workHours = new WorkHours();
            workHours.setOrderId(orderId);
            workHours.setOrderNo(orderNo);
            workHours.setProcessStep(processStep);
            workHours.setLaborHours(laborHours);
            workHours.setMachineHours(machineHours);
            workHours.setOperatorId(UserContext.getUserId());
            workHours.setOperatorName(UserContext.getUsername());
            workHoursMapper.insert(workHours);
        }
    }

    private void updateCostAccounting(Long orderId, BigDecimal laborHours,
                                      BigDecimal machineHours, Integer scrapQuantity, BigDecimal unitPrice) {
        CostAccounting cost = costMapper.selectOne(
                new LambdaQueryWrapper<CostAccounting>().eq(CostAccounting::getOrderId, orderId));
        if (cost != null) {
            BigDecimal hourRate = new BigDecimal("50");
            BigDecimal machineRate = new BigDecimal("30");

            cost.setLaborHours(cost.getLaborHours().add(laborHours));
            cost.setMachineHours(cost.getMachineHours().add(machineHours));
            cost.setLaborCost(cost.getLaborCost().add(laborHours.multiply(hourRate)));
            cost.setEnergyCost(cost.getEnergyCost().add(machineHours.multiply(machineRate)));

            if (scrapQuantity > 0 && unitPrice != null) {
                BigDecimal scrapCost = new BigDecimal(scrapQuantity).multiply(unitPrice);
                cost.setScrapCost(cost.getScrapCost().add(scrapCost));
            }

            cost.setTotalCost(cost.getMaterialCost()
                    .add(cost.getToolCost())
                    .add(cost.getEnergyCost())
                    .add(cost.getLaborCost())
                    .add(cost.getScrapCost()));
            costMapper.updateById(cost);
        }
    }

    @Transactional(rollbackFor = Exception.class)
    @RequiresRole({RoleConstants.QUALITY_INSPECTOR, RoleConstants.ADMIN})
    public void createInspection(QualityInspectionDto dto) {
        ProductionOrder order = orderMapper.selectById(dto.getOrderId());
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (!"WAITING_INSPECTION".equals(order.getStatus())) {
            throw new BusinessException("当前状态不允许创建质检记录");
        }
        if (dto.getInspectedQuantity() == null || dto.getInspectedQuantity() <= 0) {
            throw new BusinessException("抽检数量必须大于0");
        }
        if (dto.getPassedQuantity() == null || dto.getPassedQuantity() < 0) {
            throw new BusinessException("合格数量不能为负数");
        }
        if (dto.getPassedQuantity() > dto.getInspectedQuantity()) {
            throw new BusinessException("合格数量不能大于抽检数量");
        }

        QualityInspection inspection = new QualityInspection();
        BeanUtils.copyProperties(dto, inspection);
        inspection.setInspectionNo(BatchNoGenerator.generateBatchNo("QI"));
        inspection.setOrderNo(order.getOrderNo());
        inspection.setInspectionType("FINAL");
        inspection.setDefectRate(new BigDecimal(dto.getInspectedQuantity() - dto.getPassedQuantity())
                .divide(new BigDecimal(dto.getInspectedQuantity()), 4, RoundingMode.HALF_UP));
        inspection.setInspectorId(UserContext.getUserId());
        inspection.setInspectorName(UserContext.getUsername());
        inspection.setStatus("PENDING");
        inspectionMapper.insert(inspection);
    }

    @Transactional(rollbackFor = Exception.class)
    @RequiresRole({RoleConstants.QUALITY_INSPECTOR, RoleConstants.ADMIN})
    public void approveInspection(Long inspectionId, String approvalResult, String approvalRemark) {
        QualityInspection inspection = inspectionMapper.selectById(inspectionId);
        if (inspection == null) {
            throw new BusinessException("质检记录不存在");
        }
        if (!"PENDING".equals(inspection.getStatus())) {
            throw new BusinessException("该质检记录已审批");
        }

        inspection.setApprovalResult(approvalResult);
        inspection.setApprovalRemark(approvalRemark);
        inspection.setApproverId(UserContext.getUserId());
        inspection.setApproverName(UserContext.getUsername());
        inspection.setApprovalTime(LocalDateTime.now());
        inspection.setStatus("APPROVED");
        inspectionMapper.updateById(inspection);

        if ("PASS".equals(approvalResult)) {
            ProductionOrder order = orderMapper.selectById(inspection.getOrderId());
            if (order != null) {
                order.setStatus("COMPLETED");
                order.setActualEndDate(LocalDateTime.now());
                orderMapper.updateById(order);

                CostAccounting cost = costMapper.selectOne(
                        new LambdaQueryWrapper<CostAccounting>().eq(CostAccounting::getOrderId, order.getId()));
                if (cost != null) {
                    cost.setStatus("CONFIRMED");
                    costMapper.updateById(cost);
                }
            }
        }

        clearOrderCache();
    }

    @Transactional(rollbackFor = Exception.class)
    @RequiresRole({RoleConstants.LINE_LEADER, RoleConstants.ADMIN})
    public void recordLoss(ProductionLossDto dto) {
        ProductionOrder order = orderMapper.selectById(dto.getOrderId());
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (!"PRODUCING".equals(order.getStatus())) {
            throw new BusinessException("只能在生产中记录损耗");
        }
        if (dto.getLossQuantity() == null || dto.getLossQuantity().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("损耗数量必须大于0");
        }

        ProductionLoss loss = new ProductionLoss();
        BeanUtils.copyProperties(dto, loss);
        loss.setOrderNo(order.getOrderNo());
        if (dto.getUnitPrice() == null) {
            loss.setUnitPrice(order.getUnitPrice());
        }
        loss.setTotalPrice(loss.getLossQuantity().multiply(loss.getUnitPrice()));
        loss.setOperatorId(UserContext.getUserId());
        loss.setOperatorName(UserContext.getUsername());
        productionLossMapper.insert(loss);

        CostAccounting cost = costMapper.selectOne(
                new LambdaQueryWrapper<CostAccounting>().eq(CostAccounting::getOrderId, dto.getOrderId()));
        if (cost != null) {
            if ("TOOL".equals(dto.getLossType())) {
                cost.setToolCost(cost.getToolCost().add(loss.getTotalPrice()));
            } else if ("SCRAP".equals(dto.getLossType())) {
                cost.setScrapCost(cost.getScrapCost().add(loss.getTotalPrice()));
            }
            cost.setTotalCost(cost.getMaterialCost()
                    .add(cost.getToolCost())
                    .add(cost.getEnergyCost())
                    .add(cost.getLaborCost())
                    .add(cost.getScrapCost()));
            costMapper.updateById(cost);
        }
    }

    @SuppressWarnings("unchecked")
    public IPage<QualityInspection> getInspectionPage(int page, int size, Long orderId, String status) {
        LambdaQueryWrapper<QualityInspection> wrapper = new LambdaQueryWrapper<>();
        if (orderId != null) {
            wrapper.eq(QualityInspection::getOrderId, orderId);
        }
        if (StringUtils.hasText(status)) {
            wrapper.eq(QualityInspection::getStatus, status);
        }
        wrapper.orderByDesc(QualityInspection::getCreateTime);
        return inspectionMapper.selectPage(new Page<>(page, size), wrapper);
    }

    @SuppressWarnings("unchecked")
    public IPage<ProductionLoss> getLossPage(int page, int size, Long orderId, String lossType) {
        LambdaQueryWrapper<ProductionLoss> wrapper = new LambdaQueryWrapper<>();
        if (orderId != null) {
            wrapper.eq(ProductionLoss::getOrderId, orderId);
        }
        if (StringUtils.hasText(lossType)) {
            wrapper.eq(ProductionLoss::getLossType, lossType);
        }
        wrapper.orderByDesc(ProductionLoss::getCreateTime);
        return productionLossMapper.selectPage(new Page<>(page, size), wrapper);
    }

    @SuppressWarnings("unchecked")
    public IPage<WorkHours> getWorkHoursPage(int page, int size, Long orderId) {
        LambdaQueryWrapper<WorkHours> wrapper = new LambdaQueryWrapper<>();
        if (orderId != null) {
            wrapper.eq(WorkHours::getOrderId, orderId);
        }
        wrapper.orderByDesc(WorkHours::getCreateTime);
        return workHoursMapper.selectPage(new Page<>(page, size), wrapper);
    }

    private void clearOrderCache() {
        cacheUtil.deleteByPattern(CACHE_ORDER_PREFIX + "*");
    }
}
