package com.valve.manufacture.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.valve.manufacture.dto.ProcessConfirmDTO;
import com.valve.manufacture.dto.ProcessDetailDTO;
import com.valve.manufacture.dto.ProcessMaterialDTO;
import com.valve.manufacture.entity.WorkOrder;
import com.valve.manufacture.entity.WorkOrderProcess;
import com.valve.manufacture.exception.BusinessException;
import com.valve.manufacture.mapper.WorkOrderProcessMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkOrderProcessService extends ServiceImpl<WorkOrderProcessMapper, WorkOrderProcess> {

    private final WorkOrderService workOrderService;
    private final MaterialLockService materialLockService;

    public List<WorkOrderProcess> getByWorkOrderId(Long workOrderId) {
        return list(new LambdaQueryWrapper<WorkOrderProcess>()
                .eq(WorkOrderProcess::getWorkOrderId, workOrderId)
                .eq(WorkOrderProcess::getDeleted, 0)
                .orderByAsc(WorkOrderProcess::getProcessOrder));
    }

    @Transactional(rollbackFor = Exception.class)
    public void confirmProcesses(ProcessConfirmDTO dto, Long operatorId) {
        WorkOrder workOrder = workOrderService.getById(dto.getWorkOrderId());
        if (workOrder == null) {
            throw new BusinessException("工单不存在");
        }
        if (!"PENDING".equals(workOrder.getStatus())) {
            throw new BusinessException("只有待处理工单可以确定工艺");
        }

        List<WorkOrderProcess> existProcesses = getByWorkOrderId(dto.getWorkOrderId());
        if (!existProcesses.isEmpty()) {
            for (WorkOrderProcess process : existProcesses) {
                process.setDeleted(1);
            }
            updateBatchById(existProcesses);
        }

        for (ProcessDetailDTO processDTO : dto.getProcesses()) {
            WorkOrderProcess process = new WorkOrderProcess();
            process.setWorkOrderId(dto.getWorkOrderId());
            process.setProcessName(processDTO.getProcessName());
            process.setProcessCode(processDTO.getProcessCode());
            process.setProcessOrder(processDTO.getProcessOrder());
            process.setStatus("PENDING");
            process.setRemark(processDTO.getRemark());
            save(process);

            if (processDTO.getMaterials() != null && !processDTO.getMaterials().isEmpty()) {
                for (ProcessMaterialDTO materialDTO : processDTO.getMaterials()) {
                    materialLockService.lockMaterial(
                            dto.getWorkOrderId(),
                            materialDTO.getMaterialId(),
                            materialDTO.getBatchId(),
                            materialDTO.getQuantity(),
                            operatorId
                    );
                }
            }
        }

        workOrder.setStatus("CONFIRMED");
        workOrder.setRemark(dto.getRemark());
        workOrderService.updateById(workOrder);
    }

    @Transactional(rollbackFor = Exception.class)
    public WorkOrderProcess startProcess(Long processId, Long operatorId) {
        WorkOrderProcess process = getById(processId);
        if (process == null) {
            throw new BusinessException("工序不存在");
        }
        if (!"PENDING".equals(process.getStatus())) {
            throw new BusinessException("只有待处理工序可以开始");
        }

        process.setStatus("PROCESSING");
        process.setOperatorId(operatorId);
        process.setStartTime(LocalDateTime.now());
        updateById(process);
        return process;
    }

    @Transactional(rollbackFor = Exception.class)
    public WorkOrderProcess completeProcess(Long processId) {
        WorkOrderProcess process = getById(processId);
        if (process == null) {
            throw new BusinessException("工序不存在");
        }
        if (!"PROCESSING".equals(process.getStatus())) {
            throw new BusinessException("只有进行中工序可以完成");
        }

        process.setStatus("COMPLETED");
        process.setEndTime(LocalDateTime.now());
        updateById(process);

        List<WorkOrderProcess> processes = getByWorkOrderId(process.getWorkOrderId());
        boolean allCompleted = processes.stream()
                .allMatch(p -> "COMPLETED".equals(p.getStatus()));

        if (allCompleted) {
            WorkOrder workOrder = workOrderService.getById(process.getWorkOrderId());
            if (workOrder != null) {
                workOrder.setStatus("FINISHED");
                workOrderService.updateById(workOrder);
            }
        }

        return process;
    }
}
