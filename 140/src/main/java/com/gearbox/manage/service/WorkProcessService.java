package com.gearbox.manage.service;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.gearbox.manage.context.UserContext;
import com.gearbox.manage.dto.ProcessCompleteDTO;
import com.gearbox.manage.dto.ProcessStartDTO;
import com.gearbox.manage.entity.SysUser;
import com.gearbox.manage.entity.WorkProcess;
import com.gearbox.manage.entity.WorkOrder;
import com.gearbox.manage.exception.BusinessException;
import com.gearbox.manage.mapper.WorkProcessMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkProcessService extends ServiceImpl<WorkProcessMapper, WorkProcess> {

    private final WorkOrderService workOrderService;
    private final SysUserService sysUserService;

    public List<WorkProcess> listByWorkOrderId(Long workOrderId) {
        return lambdaQuery()
                .eq(WorkProcess::getWorkOrderId, workOrderId)
                .orderByAsc(WorkProcess::getProcessOrder)
                .list();
    }

    @Transactional(rollbackFor = Exception.class)
    public boolean startProcess(ProcessStartDTO dto) {
        WorkProcess process = getById(dto.getProcessId());
        if (process == null) {
            throw new BusinessException("工序不存在");
        }
        if (!"PENDING".equals(process.getStatus())) {
            throw new BusinessException("工序状态不正确，无法开始");
        }

        List<WorkProcess> allProcesses = listByWorkOrderId(process.getWorkOrderId());
        for (WorkProcess p : allProcesses) {
            if (p.getProcessOrder() < process.getProcessOrder() && !"COMPLETED".equals(p.getStatus())) {
                throw new BusinessException("请先完成前序工序");
            }
        }

        Long userId = UserContext.getUserId();
        SysUser user = sysUserService.getById(userId);

        process.setOperatorId(userId);
        process.setOperatorName(user != null ? user.getRealName() : "");
        process.setStartTime(LocalDateTime.now());
        process.setMachineCode(dto.getMachineCode());
        process.setStatus("PROCESSING");
        process.setRemark(dto.getRemark());

        if (process.getProcessOrder() == 1) {
            WorkOrder workOrder = workOrderService.getById(process.getWorkOrderId());
            if (workOrder != null) {
                workOrder.setStatus("ROUGH_MILLING");
                workOrder.setActualStartDate(LocalDateTime.now());
                workOrderService.updateById(workOrder);
            }
        }

        return updateById(process);
    }

    @Transactional(rollbackFor = Exception.class)
    public boolean completeProcess(ProcessCompleteDTO dto) {
        WorkProcess process = getById(dto.getProcessId());
        if (process == null) {
            throw new BusinessException("工序不存在");
        }
        if (!"PROCESSING".equals(process.getStatus())) {
            throw new BusinessException("工序状态不正确，无法完成");
        }

        process.setEndTime(LocalDateTime.now());
        process.setStatus("COMPLETED");

        if (dto.getWorkHours() != null) {
            process.setWorkHours(dto.getWorkHours());
        } else if (process.getStartTime() != null) {
            Duration duration = Duration.between(process.getStartTime(), process.getEndTime());
            double hours = duration.toMinutes() / 60.0;
            process.setWorkHours(BigDecimal.valueOf(hours).setScale(2, java.math.RoundingMode.HALF_UP));
        }

        if (dto.getMachineHours() != null) {
            process.setMachineHours(dto.getMachineHours());
        }
        if (dto.getToolUsage() != null) {
            process.setToolUsage(dto.getToolUsage());
        }
        if (dto.getRemark() != null) {
            process.setRemark(dto.getRemark());
        }

        updateById(process);

        updateWorkOrderStatus(process.getWorkOrderId());

        return true;
    }

    private void updateWorkOrderStatus(Long workOrderId) {
        List<WorkProcess> processes = listByWorkOrderId(workOrderId);
        boolean allCompleted = processes.stream().allMatch(p -> "COMPLETED".equals(p.getStatus()));

        if (allCompleted) {
            WorkOrder workOrder = workOrderService.getById(workOrderId);
            if (workOrder != null) {
                workOrder.setStatus("INSPECTION");
                BigDecimal totalHours = processes.stream()
                        .map(WorkProcess::getWorkHours)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                workOrder.setTotalHours(totalHours);
                workOrderService.updateById(workOrder);
            }
        }
    }
}
