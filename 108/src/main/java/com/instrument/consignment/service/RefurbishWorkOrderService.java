package com.instrument.consignment.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.instrument.consignment.dto.WorkOrderDTO;
import com.instrument.consignment.entity.InstrumentArchive;
import com.instrument.consignment.entity.RefurbishWorkOrder;
import com.instrument.consignment.entity.WorkOrderStep;
import com.instrument.consignment.enums.ArchiveStatusEnum;
import com.instrument.consignment.enums.WorkOrderStatusEnum;
import com.instrument.consignment.exception.BusinessException;
import com.instrument.consignment.mapper.InstrumentArchiveMapper;
import com.instrument.consignment.mapper.RefurbishWorkOrderMapper;
import com.instrument.consignment.mapper.WorkOrderStepMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefurbishWorkOrderService {

    private final RefurbishWorkOrderMapper workOrderMapper;
    private final WorkOrderStepMapper workOrderStepMapper;
    private final InstrumentArchiveMapper archiveMapper;

    @Transactional(rollbackFor = Exception.class)
    public void createWorkOrder(WorkOrderDTO workOrderDTO) {
        InstrumentArchive archive = archiveMapper.selectById(workOrderDTO.getArchiveId());
        if (archive == null) {
            throw new BusinessException("乐器档案不存在");
        }

        RefurbishWorkOrder workOrder = new RefurbishWorkOrder();
        BeanUtils.copyProperties(workOrderDTO, workOrder);
        workOrder.setWorkOrderNo(generateWorkOrderNo());
        workOrder.setTraceNo(archive.getTraceNo());
        workOrder.setStatus(WorkOrderStatusEnum.PENDING.getCode());
        workOrder.setReceiveTime(LocalDateTime.now());
        workOrderMapper.insert(workOrder);

        List<WorkOrderStep> steps = initWorkOrderSteps(workOrder.getId());
        for (WorkOrderStep step : steps) {
            workOrderStepMapper.insert(step);
        }
    }

    private String generateWorkOrderNo() {
        return "WO" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
    }

    private List<WorkOrderStep> initWorkOrderSteps(Long workOrderId) {
        List<WorkOrderStep> steps = new ArrayList<>();
        String[][] stepInfo = {
                {"IDENTIFY", "实物鉴定"},
                {"DISASSEMBLE", "拆解清洁"},
                {"PARTS_REPLACE", "配件更换"},
                {"TUNING", "调音校准"},
                {"FINAL_CHECK", "最终校验"}
        };
        for (String[] info : stepInfo) {
            WorkOrderStep step = new WorkOrderStep();
            step.setWorkOrderId(workOrderId);
            step.setStepType(info[0]);
            step.setStepName(info[1]);
            step.setStatus(0);
            step.setMaterialCost(BigDecimal.ZERO);
            step.setLaborHours(BigDecimal.ZERO);
            step.setLaborCost(BigDecimal.ZERO);
            steps.add(step);
        }
        return steps;
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateWorkOrderStatus(Long id, String status) {
        RefurbishWorkOrder workOrder = workOrderMapper.selectById(id);
        if (workOrder == null) {
            throw new BusinessException("工单不存在");
        }

        String currentStatus = workOrder.getStatus();

        validateStatusTransition(currentStatus, status);

        workOrder.setStatus(status);
        workOrder.setStatusConfirmTime(LocalDateTime.now());
        workOrderMapper.updateById(workOrder);

        autoUpdateArchiveStatus(workOrder.getArchiveId(), status);
    }

    private void validateStatusTransition(String currentStatus, String targetStatus) {
        boolean validTransition = switch (currentStatus) {
            case "PENDING" -> targetStatus.equals("ESTIMATING") || targetStatus.equals("CANCELLED");
            case "ESTIMATING" -> targetStatus.equals("ESTIMATED") || targetStatus.equals("CANCELLED");
            case "ESTIMATED" -> targetStatus.equals("REFURBISHING") || targetStatus.equals("SHELVED") || targetStatus.equals("CANCELLED");
            case "SHELVED" -> targetStatus.equals("REFURBISHING") || targetStatus.equals("CANCELLED");
            case "REFURBISHING" -> targetStatus.equals("COMPLETED") || targetStatus.equals("CANCELLED");
            case "COMPLETED", "CANCELLED" -> false;
            default -> false;
        };

        if (!validTransition) {
            throw new BusinessException("不允许的状态流转：" + currentStatus + " -> " + targetStatus);
        }
    }

    private void autoUpdateArchiveStatus(Long archiveId, String workOrderStatus) {
        InstrumentArchive archive = archiveMapper.selectById(archiveId);
        if (archive == null) {
            return;
        }

        String archiveStatus = switch (workOrderStatus) {
            case "PENDING", "ESTIMATING", "ESTIMATED", "SHELVED" -> ArchiveStatusEnum.TO_REFURBISH.getCode();
            case "REFURBISHING" -> ArchiveStatusEnum.REFURBISHING.getCode();
            case "COMPLETED" -> ArchiveStatusEnum.TO_SELL.getCode();
            case "CANCELLED" -> ArchiveStatusEnum.TO_REFURBISH.getCode();
            default -> null;
        };

        if (archiveStatus != null) {
            archive.setStatus(archiveStatus);
            archiveMapper.updateById(archive);
        }
    }

    public void startEstimation(Long orderId, Long estimatorId) {
        RefurbishWorkOrder workOrder = workOrderMapper.selectById(orderId);
        if (workOrder == null) {
            throw new BusinessException("工单不存在");
        }
        if (!"PENDING".equals(workOrder.getStatus())) {
            throw new BusinessException("只有待估价状态的工单才能开始估价");
        }

        workOrder.setEstimatorId(estimatorId);
        workOrder.setStatus("ESTIMATING");
        workOrder.setStatusConfirmTime(LocalDateTime.now());
        workOrderMapper.updateById(workOrder);
    }

    public void submitEstimation(Long orderId, String remark) {
        RefurbishWorkOrder workOrder = workOrderMapper.selectById(orderId);
        if (workOrder == null) {
            throw new BusinessException("工单不存在");
        }
        if (!"ESTIMATING".equals(workOrder.getStatus())) {
            throw new BusinessException("只有估价中的工单才能提交估价");
        }

        workOrder.setStatus("ESTIMATED");
        workOrder.setEstimateRemark(remark);
        workOrder.setStatusConfirmTime(LocalDateTime.now());
        workOrderMapper.updateById(workOrder);
    }

    public void startRefurbish(Long orderId, Long craftsmanId) {
        RefurbishWorkOrder workOrder = workOrderMapper.selectById(orderId);
        if (workOrder == null) {
            throw new BusinessException("工单不存在");
        }
        if (!"ESTIMATED".equals(workOrder.getStatus()) && !"SHELVED".equals(workOrder.getStatus())) {
            throw new BusinessException("只有已估价或搁置状态的工单才能开始翻新");
        }

        workOrder.setCraftsmanId(craftsmanId);
        workOrder.setStatus("REFURBISHING");
        workOrder.setStatusConfirmTime(LocalDateTime.now());
        workOrderMapper.updateById(workOrder);

        autoUpdateArchiveStatus(workOrder.getArchiveId(), "REFURBISHING");
    }

    @Transactional(rollbackFor = Exception.class)
    public void completeWorkOrder(Long orderId) {
        RefurbishWorkOrder workOrder = workOrderMapper.selectById(orderId);
        if (workOrder == null) {
            throw new BusinessException("工单不存在");
        }
        if (!"REFURBISHING".equals(workOrder.getStatus())) {
            throw new BusinessException("只有翻新中的工单才能完成");
        }

        List<WorkOrderStep> steps = workOrderStepMapper.selectList(
                new LambdaQueryWrapper<WorkOrderStep>()
                        .eq(WorkOrderStep::getWorkOrderId, orderId)
        );

        boolean allCompleted = steps.stream().allMatch(step -> step.getStatus() == 2);
        if (!allCompleted) {
            throw new BusinessException("还有未完成的翻新步骤，无法完工");
        }

        BigDecimal totalMaterialCost = steps.stream()
                .map(WorkOrderStep::getMaterialCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalLaborCost = steps.stream()
                .map(WorkOrderStep::getLaborCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        workOrder.setActualMaterialCost(totalMaterialCost);
        workOrder.setActualLaborCost(totalLaborCost);
        workOrder.setTotalRefurbishCost(totalMaterialCost.add(totalLaborCost));
        workOrder.setStatus("COMPLETED");
        workOrder.setCompleteTime(LocalDateTime.now());
        workOrderMapper.updateById(workOrder);

        autoUpdateArchiveStatus(workOrder.getArchiveId(), "COMPLETED");
    }

    public Page<RefurbishWorkOrder> getWorkOrderPage(int page, int size, String status, Long craftsmanId, Long estimatorId) {
        Page<RefurbishWorkOrder> pageParam = new Page<>(page, size);
        return workOrderMapper.selectPage(pageParam,
                new LambdaQueryWrapper<RefurbishWorkOrder>()
                        .eq(status != null, RefurbishWorkOrder::getStatus, status)
                        .eq(craftsmanId != null, RefurbishWorkOrder::getCraftsmanId, craftsmanId)
                        .eq(estimatorId != null, RefurbishWorkOrder::getEstimatorId, estimatorId)
                        .orderByDesc(RefurbishWorkOrder::getCreateTime)
        );
    }

    public RefurbishWorkOrder getWorkOrderDetail(Long id) {
        RefurbishWorkOrder workOrder = workOrderMapper.selectById(id);
        if (workOrder == null) {
            throw new BusinessException("工单不存在");
        }
        List<WorkOrderStep> steps = workOrderStepMapper.selectList(
                new LambdaQueryWrapper<WorkOrderStep>()
                        .eq(WorkOrderStep::getWorkOrderId, id)
                        .orderByAsc(WorkOrderStep::getId)
        );
        workOrder.setSteps(steps);
        return workOrder;
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateWorkOrderStep(Long stepId, WorkOrderStep stepDTO) {
        WorkOrderStep step = workOrderStepMapper.selectById(stepId);
        if (step == null) {
            throw new BusinessException("工单步骤不存在");
        }
        BeanUtils.copyProperties(stepDTO, step);
        step.setOperateTime(LocalDateTime.now());
        workOrderStepMapper.updateById(step);

        updateWorkOrderTotalCost(step.getWorkOrderId());
    }

    private void updateWorkOrderTotalCost(Long workOrderId) {
        List<WorkOrderStep> steps = workOrderStepMapper.selectList(
                new LambdaQueryWrapper<WorkOrderStep>()
                        .eq(WorkOrderStep::getWorkOrderId, workOrderId)
        );
        BigDecimal totalMaterialCost = steps.stream()
                .map(WorkOrderStep::getMaterialCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalLaborCost = steps.stream()
                .map(WorkOrderStep::getLaborCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        RefurbishWorkOrder workOrder = new RefurbishWorkOrder();
        workOrder.setId(workOrderId);
        workOrder.setActualMaterialCost(totalMaterialCost);
        workOrder.setActualLaborCost(totalLaborCost);
        workOrder.setTotalRefurbishCost(totalMaterialCost.add(totalLaborCost));
        workOrderMapper.updateById(workOrder);
    }

    public void shelveTimeoutOrders() {
        LocalDateTime timeoutTime = LocalDateTime.now().minusHours(48);
        List<RefurbishWorkOrder> timeoutOrders = workOrderMapper.selectList(
                new LambdaQueryWrapper<RefurbishWorkOrder>()
                        .eq(RefurbishWorkOrder::getStatus, WorkOrderStatusEnum.ESTIMATED.getCode())
                        .le(RefurbishWorkOrder::getStatusConfirmTime, timeoutTime)
                        .eq(RefurbishWorkOrder::getIsTimeoutReminded, 0)
        );

        for (RefurbishWorkOrder order : timeoutOrders) {
            order.setStatus(WorkOrderStatusEnum.SHELVED.getCode());
            order.setIsTimeoutReminded(1);
            workOrderMapper.updateById(order);
        }
    }
}
