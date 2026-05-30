package com.snacktrace.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.snacktrace.entity.WorkOrderProcess;
import com.snacktrace.enums.WorkOrderStatusEnum;
import com.snacktrace.mapper.WorkOrderProcessMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class WorkOrderProcessService extends ServiceImpl<WorkOrderProcessMapper, WorkOrderProcess> {

    public WorkOrderProcess startProcess(Long workOrderId, Integer stage, Long operatorId, String operatorName) {
        WorkOrderStatusEnum statusEnum = WorkOrderStatusEnum.values()[stage - 1];
        WorkOrderProcess process = new WorkOrderProcess();
        process.setWorkOrderId(workOrderId);
        process.setProcessStage(stage);
        process.setProcessName(statusEnum.getDesc());
        process.setOperatorId(operatorId);
        process.setOperatorName(operatorName);
        process.setStartTime(LocalDateTime.now());
        process.setProcessStatus(1);
        process.setCreateTime(LocalDateTime.now());
        save(process);
        return process;
    }

    public boolean endProcess(Long workOrderId, Integer stage, String remark) {
        LambdaQueryWrapper<WorkOrderProcess> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(WorkOrderProcess::getWorkOrderId, workOrderId)
               .eq(WorkOrderProcess::getProcessStage, stage)
               .eq(WorkOrderProcess::getProcessStatus, 1)
               .orderByDesc(WorkOrderProcess::getCreateTime)
               .last("LIMIT 1");
        WorkOrderProcess process = getOne(wrapper);
        if (process != null) {
            process.setEndTime(LocalDateTime.now());
            process.setProcessStatus(2);
            process.setRemark(remark);
            return updateById(process);
        }
        return false;
    }

    public List<WorkOrderProcess> getProcessList(Long workOrderId) {
        LambdaQueryWrapper<WorkOrderProcess> wrapper = new LambdaQueryWrapper<>();
        if (workOrderId != null) {
            wrapper.eq(WorkOrderProcess::getWorkOrderId, workOrderId);
        }
        wrapper.orderByAsc(WorkOrderProcess::getProcessStage);
        return list(wrapper);
    }
}
