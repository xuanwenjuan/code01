package com.aluminum.extrusion.service;

import com.aluminum.extrusion.dto.WorkOrderQueryDTO;
import com.aluminum.extrusion.entity.AluminumStock;
import com.aluminum.extrusion.entity.ProductCategory;
import com.aluminum.extrusion.entity.ProductionCost;
import com.aluminum.extrusion.entity.WorkOrder;
import com.aluminum.extrusion.enums.WorkOrderStatusEnum;
import com.aluminum.extrusion.exception.BusinessException;
import com.aluminum.extrusion.mapper.WorkOrderMapper;
import com.aluminum.extrusion.util.UserContext;
import com.aluminum.extrusion.vo.WorkOrderDetailVO;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class WorkOrderService extends ServiceImpl<WorkOrderMapper, WorkOrder> {

    private final ProductCategoryService productCategoryService;
    private final AluminumStockService aluminumStockService;
    private final ProductionCostService productionCostService;
    private final OperationLogService operationLogService;

    @Transactional(rollbackFor = Exception.class)
    public void createWorkOrder(WorkOrder workOrder) {
        ProductCategory category = productCategoryService.getById(workOrder.getCategoryId());
        if (category == null) {
            throw new BusinessException("产品类目不存在");
        }

        if (!productCategoryService.isCategoryOnline(workOrder.getCategoryId())) {
            throw new BusinessException("该产品类目已下线，不能下发工单");
        }

        AluminumStock stock = aluminumStockService.getById(workOrder.getStockId());
        if (stock == null) {
            throw new BusinessException("铝棒原料不存在");
        }

        BigDecimal availableQuantity = stock.getQuantity().subtract(
                stock.getLockedQuantity() != null ? stock.getLockedQuantity() : BigDecimal.ZERO);
        if (availableQuantity.compareTo(workOrder.getPlanQuantity()) < 0) {
            throw new BusinessException("库存不足，可用数量: " + availableQuantity);
        }

        String orderNo = generateOrderNo();
        workOrder.setOrderNo(orderNo);
        workOrder.setCategoryName(category.getCategoryName());
        workOrder.setBatchNo(stock.getBatchNo());
        workOrder.setAlloyGrade(stock.getAlloyGrade());
        workOrder.setStatus(WorkOrderStatusEnum.PENDING.getCode());
        workOrder.setOperator(UserContext.getUsername());
        workOrder.setActualQuantity(BigDecimal.ZERO);
        workOrder.setScrapQuantity(BigDecimal.ZERO);
        workOrder.setHeatingLoss(BigDecimal.ZERO);
        workOrder.setExtrusionLoss(BigDecimal.ZERO);
        workOrder.setCuttingLoss(BigDecimal.ZERO);
        workOrder.setSurfaceLoss(BigDecimal.ZERO);

        save(workOrder);

        operationLogService.log("创建工单", "创建了工单号: " + orderNo +
                ", 产品: " + category.getCategoryName() +
                ", 计划产量: " + workOrder.getPlanQuantity());
    }

    @Transactional(rollbackFor = Exception.class)
    public void confirmProcess(Long id, String extrusionProcess, String moldCode,
                               BigDecimal heatingTemp, BigDecimal extrusionSpeed) {
        WorkOrder workOrder = getById(id);
        if (workOrder == null) {
            throw new BusinessException("工单不存在");
        }

        if (!workOrder.getStatus().equals(WorkOrderStatusEnum.PENDING.getCode())) {
            throw new BusinessException("工单已启动生产，不能重新设置工艺");
        }

        workOrder.setExtrusionProcess(extrusionProcess);
        workOrder.setMoldCode(moldCode);
        workOrder.setHeatingTemp(heatingTemp);
        workOrder.setExtrusionSpeed(extrusionSpeed);
        updateById(workOrder);

        aluminumStockService.lockStock(workOrder.getStockId(), workOrder.getPlanQuantity(), workOrder.getOrderNo());

        operationLogService.log("确认工艺", "工单号: " + workOrder.getOrderNo() +
                ", 工艺方案: " + extrusionProcess +
                ", 模具: " + moldCode);
    }

    @Transactional(rollbackFor = Exception.class)
    public void nextProcess(Long id, BigDecimal outputQuantity, BigDecimal lossQuantity) {
        WorkOrder workOrder = getById(id);
        if (workOrder == null) {
            throw new BusinessException("工单不存在");
        }

        if (workOrder.getStatus().equals(WorkOrderStatusEnum.PAUSED.getCode())) {
            throw new BusinessException("工单已暂停，请先恢复");
        }

        if (workOrder.getStatus().equals(WorkOrderStatusEnum.COMPLETED.getCode())) {
            throw new BusinessException("工单已完成");
        }

        if (workOrder.getStatus().equals(WorkOrderStatusEnum.PENDING.getCode())) {
            workOrder.setStartTime(LocalDateTime.now());
        }

        WorkOrderStatusEnum nextStatus = WorkOrderStatusEnum.getNextStatus(workOrder.getStatus());
        if (nextStatus == null) {
            throw new BusinessException("无法继续下一工序");
        }

        if (outputQuantity != null) {
            workOrder.setActualQuantity(workOrder.getActualQuantity().add(outputQuantity));
        }

        if (lossQuantity != null) {
            accumulateLoss(workOrder, workOrder.getStatus(), lossQuantity);
        }

        workOrder.setStatus(nextStatus.getCode());
        workOrder.setOperator(UserContext.getUsername());

        if (nextStatus.equals(WorkOrderStatusEnum.COMPLETED)) {
            workOrder.setEndTime(LocalDateTime.now());
            completeWorkOrder(workOrder);
        }

        updateById(workOrder);

        operationLogService.log("工单流转", "工单号 " + workOrder.getOrderNo() +
                " 流转到: " + nextStatus.getDescription());
    }

    private void accumulateLoss(WorkOrder workOrder, Integer currentStatus, BigDecimal lossQuantity) {
        WorkOrderStatusEnum status = WorkOrderStatusEnum.getByCode(currentStatus);
        if (status == null) return;

        switch (status) {
            case PENDING:
            case PREHEATING:
                workOrder.setHeatingLoss(workOrder.getHeatingLoss().add(lossQuantity));
                break;
            case EXTRUDING:
                workOrder.setExtrusionLoss(workOrder.getExtrusionLoss().add(lossQuantity));
                break;
            case COOLING:
            case CUTTING:
            case FINISH_CUTTING:
                workOrder.setCuttingLoss(workOrder.getCuttingLoss().add(lossQuantity));
                break;
            case OXIDIZING:
            case SORTING:
                workOrder.setSurfaceLoss(workOrder.getSurfaceLoss().add(lossQuantity));
                break;
            default:
                break;
        }

        workOrder.setScrapQuantity(workOrder.getHeatingLoss()
                .add(workOrder.getExtrusionLoss())
                .add(workOrder.getCuttingLoss())
                .add(workOrder.getSurfaceLoss()));
    }

    @Transactional(rollbackFor = Exception.class)
    protected void completeWorkOrder(WorkOrder workOrder) {
        aluminumStockService.consumeStock(
                workOrder.getStockId(),
                workOrder.getPlanQuantity(),
                workOrder.getScrapQuantity(),
                workOrder.getOrderNo()
        );

        autoCalculateCost(workOrder);

        operationLogService.log("工单完成", "工单号: " + workOrder.getOrderNo() +
                ", 实际产量: " + workOrder.getActualQuantity() +
                ", 总损耗: " + workOrder.getScrapQuantity());
    }

    @Transactional(rollbackFor = Exception.class)
    public void autoCalculateCost(WorkOrder workOrder) {
        AluminumStock stock = aluminumStockService.getById(workOrder.getStockId());
        if (stock == null) {
            throw new BusinessException("原料记录不存在");
        }

        BigDecimal unitPrice = new BigDecimal("25.00");

        BigDecimal totalLoss = workOrder.getHeatingLoss()
                .add(workOrder.getExtrusionLoss())
                .add(workOrder.getCuttingLoss())
                .add(workOrder.getSurfaceLoss());

        ProductionCost cost = new ProductionCost();
        cost.setWorkOrderId(workOrder.getId());
        cost.setOrderNo(workOrder.getOrderNo());
        cost.setCategoryId(workOrder.getCategoryId());
        cost.setCategoryName(workOrder.getCategoryName());

        cost.setMaterialCost(workOrder.getPlanQuantity().multiply(unitPrice));
        cost.setMoldCost(calculateMoldCost(workOrder.getPlanQuantity()));
        cost.setEnergyCost(calculateEnergyCost(workOrder));
        cost.setLaborCost(calculateLaborCost(workOrder.getActualQuantity()));
        cost.setScrapCost(totalLoss.multiply(unitPrice));

        BigDecimal totalCost = cost.getMaterialCost()
                .add(cost.getMoldCost())
                .add(cost.getEnergyCost())
                .add(cost.getLaborCost())
                .add(cost.getScrapCost());
        cost.setTotalCost(totalCost);

        BigDecimal outputPrice = new BigDecimal("35.00");
        cost.setOutputValue(workOrder.getActualQuantity().multiply(outputPrice));
        cost.setProfit(cost.getOutputValue().subtract(totalCost));

        productionCostService.save(cost);

        operationLogService.log("自动成本核算", "工单号: " + workOrder.getOrderNo() +
                ", 总成本: " + totalCost +
                ", 利润: " + cost.getProfit());
    }

    private BigDecimal calculateMoldCost(BigDecimal quantity) {
        return quantity.multiply(new BigDecimal("2.00"));
    }

    private BigDecimal calculateEnergyCost(WorkOrder workOrder) {
        return workOrder.getActualQuantity().multiply(new BigDecimal("3.50"));
    }

    private BigDecimal calculateLaborCost(BigDecimal quantity) {
        return quantity.multiply(new BigDecimal("2.50"));
    }

    @Transactional(rollbackFor = Exception.class)
    public void jumpToProcess(Long id, Integer targetStatus) {
        WorkOrder workOrder = getById(id);
        if (workOrder == null) {
            throw new BusinessException("工单不存在");
        }

        if (workOrder.getStatus().equals(WorkOrderStatusEnum.PAUSED.getCode())) {
            throw new BusinessException("工单已暂停，请先恢复");
        }

        if (workOrder.getStatus().equals(WorkOrderStatusEnum.COMPLETED.getCode())) {
            throw new BusinessException("工单已完成");
        }

        WorkOrderStatusEnum targetStatusEnum = WorkOrderStatusEnum.getByCode(targetStatus);
        if (targetStatusEnum == null) {
            throw new BusinessException("目标状态无效");
        }

        if (targetStatus <= workOrder.getStatus()) {
            throw new BusinessException("不能回退到之前的工序");
        }

        if (workOrder.getStatus().equals(WorkOrderStatusEnum.PENDING.getCode())) {
            workOrder.setStartTime(LocalDateTime.now());
        }

        workOrder.setStatus(targetStatus);
        workOrder.setOperator(UserContext.getUsername());

        if (targetStatusEnum.equals(WorkOrderStatusEnum.COMPLETED)) {
            workOrder.setEndTime(LocalDateTime.now());
            completeWorkOrder(workOrder);
        }

        updateById(workOrder);

        operationLogService.log("工单跳级", "工单号 " + workOrder.getOrderNo() +
                " 跳级到: " + targetStatusEnum.getDescription());
    }

    @Transactional(rollbackFor = Exception.class)
    public void pauseOverdueOrders() {
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        LambdaQueryWrapper<WorkOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(WorkOrder::getStatus, WorkOrderStatusEnum.PENDING.getCode())
                .lt(WorkOrder::getCreateTime, sevenDaysAgo);

        list(wrapper).forEach(order -> {
            order.setStatus(WorkOrderStatusEnum.PAUSED.getCode());
            updateById(order);
            operationLogService.log("工单暂停", "超期未启动，自动暂停工单号: " + order.getOrderNo());
        });
    }

    @Transactional(rollbackFor = Exception.class)
    public void resumeOrder(Long id) {
        WorkOrder workOrder = getById(id);
        if (workOrder == null) {
            throw new BusinessException("工单不存在");
        }

        if (!workOrder.getStatus().equals(WorkOrderStatusEnum.PAUSED.getCode())) {
            throw new BusinessException("工单未暂停");
        }

        workOrder.setStatus(WorkOrderStatusEnum.PENDING.getCode());
        workOrder.setOperator(UserContext.getUsername());
        updateById(workOrder);

        operationLogService.log("工单恢复", "恢复工单号: " + workOrder.getOrderNo());
    }

    @Transactional(rollbackFor = Exception.class)
    public void cancelOrder(Long id) {
        WorkOrder workOrder = getById(id);
        if (workOrder == null) {
            throw new BusinessException("工单不存在");
        }

        if (workOrder.getStatus() > WorkOrderStatusEnum.PENDING.getCode()
                && workOrder.getStatus() < WorkOrderStatusEnum.COMPLETED.getCode()) {
            throw new BusinessException("工单已进入生产流程，无法取消");
        }

        if (workOrder.getStatus().equals(WorkOrderStatusEnum.PENDING.getCode())) {
            aluminumStockService.unlockStock(workOrder.getOrderNo());
        }

        removeById(id);
        operationLogService.log("工单取消", "取消工单号: " + workOrder.getOrderNo());
    }

    public IPage<WorkOrder> getOrderPage(WorkOrderQueryDTO queryDTO) {
        LambdaQueryWrapper<WorkOrder> wrapper = new LambdaQueryWrapper<>();

        if (queryDTO.getStatus() != null) {
            wrapper.eq(WorkOrder::getStatus, queryDTO.getStatus());
        }
        if (queryDTO.getCategoryId() != null) {
            wrapper.eq(WorkOrder::getCategoryId, queryDTO.getCategoryId());
        }
        if (StringUtils.hasText(queryDTO.getOrderNo())) {
            wrapper.like(WorkOrder::getOrderNo, queryDTO.getOrderNo());
        }
        if (StringUtils.hasText(queryDTO.getAlloyGrade())) {
            wrapper.like(WorkOrder::getAlloyGrade, queryDTO.getAlloyGrade());
        }
        if (queryDTO.getStartTime() != null) {
            wrapper.ge(WorkOrder::getCreateTime, queryDTO.getStartTime());
        }
        if (queryDTO.getEndTime() != null) {
            wrapper.le(WorkOrder::getCreateTime, queryDTO.getEndTime());
        }

        wrapper.orderByDesc(WorkOrder::getCreateTime);
        return page(new Page<>(queryDTO.getCurrent(), queryDTO.getSize()), wrapper);
    }

    public WorkOrderDetailVO getOrderDetail(Long id) {
        WorkOrder workOrder = getById(id);
        if (workOrder == null) {
            throw new BusinessException("工单不存在");
        }

        WorkOrderDetailVO vo = new WorkOrderDetailVO();
        BeanUtils.copyProperties(workOrder, vo);

        WorkOrderStatusEnum statusEnum = WorkOrderStatusEnum.getByCode(workOrder.getStatus());
        if (statusEnum != null) {
            vo.setStatusName(statusEnum.getDescription());
        }

        BigDecimal totalLoss = workOrder.getHeatingLoss()
                .add(workOrder.getExtrusionLoss())
                .add(workOrder.getCuttingLoss())
                .add(workOrder.getSurfaceLoss());
        vo.setTotalLoss(totalLoss);

        if (workOrder.getPlanQuantity().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal yieldRate = workOrder.getActualQuantity()
                    .divide(workOrder.getPlanQuantity(), 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"));
            vo.setYieldRate(yieldRate);
        } else {
            vo.setYieldRate(BigDecimal.ZERO);
        }

        return vo;
    }

    public List<WorkOrder> getPendingOrders() {
        LambdaQueryWrapper<WorkOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(WorkOrder::getStatus, WorkOrderStatusEnum.PENDING.getCode());
        wrapper.orderByDesc(WorkOrder::getCreateTime);
        return list(wrapper);
    }

    public List<WorkOrder> getProcessingOrders() {
        LambdaQueryWrapper<WorkOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.gt(WorkOrder::getStatus, WorkOrderStatusEnum.PENDING.getCode());
        wrapper.lt(WorkOrder::getStatus, WorkOrderStatusEnum.COMPLETED.getCode());
        wrapper.orderByAsc(WorkOrder::getStatus);
        return list(wrapper);
    }

    private String generateOrderNo() {
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String prefix = "WO" + dateStr;

        LambdaQueryWrapper<WorkOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.likeRight(WorkOrder::getOrderNo, prefix);
        wrapper.orderByDesc(WorkOrder::getOrderNo);
        wrapper.last("limit 1");

        WorkOrder lastOrder = getOne(wrapper);
        int sequence = 1;
        if (lastOrder != null && lastOrder.getOrderNo() != null) {
            String lastSeq = lastOrder.getOrderNo().substring(lastOrder.getOrderNo().length() - 4);
            sequence = Integer.parseInt(lastSeq) + 1;
        }

        return String.format("%s%04d", prefix, dateStr, sequence);
    }
}
