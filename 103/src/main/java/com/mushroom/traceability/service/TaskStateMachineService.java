package com.mushroom.traceability.service;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.mushroom.traceability.common.Constants;
import com.mushroom.traceability.entity.HarvestTask;
import com.mushroom.traceability.enums.TaskStatusEnum;
import com.mushroom.traceability.exception.BusinessException;
import com.mushroom.traceability.mapper.HarvestTaskMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class TaskStateMachineService extends ServiceImpl<HarvestTaskMapper, HarvestTask> {

    private final OperationLogService operationLogService;
    private final HarvestDetailService harvestDetailService;

    @Transactional(rollbackFor = Exception.class)
    public boolean transitionStatus(Long taskId, String targetStatus, String remark) {
        HarvestTask task = getById(taskId);
        if (task == null) {
            throw new BusinessException("任务不存在");
        }

        String currentStatus = task.getTaskStatus();
        
        if (!TaskStatusEnum.isValidTransition(currentStatus, targetStatus)) {
            throw new BusinessException(
                String.format("状态转换不合法: %s -> %s", 
                    TaskStatusEnum.getDesc(currentStatus), 
                    TaskStatusEnum.getDesc(targetStatus))
            );
        }

        task.setTaskStatus(targetStatus);
        
        if (Constants.TASK_STATUS_WAREHOUSE.equals(targetStatus)) {
            task.setWarehouseTime(LocalDateTime.now());
            BigDecimal totalQuantity = harvestDetailService.listByTaskId(taskId).stream()
                .map(d -> d.getHarvestQuantity() != null ? d.getHarvestQuantity() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            task.setActualQuantity(totalQuantity);
        }
        
        if (Constants.TASK_STATUS_SHIPPED.equals(targetStatus)) {
            task.setShipTime(LocalDateTime.now());
        }

        boolean result = updateById(task);
        if (result) {
            String logContent = String.format("状态变更: %s -> %s", 
                TaskStatusEnum.getDesc(currentStatus), 
                TaskStatusEnum.getDesc(targetStatus));
            if (remark != null) {
                logContent += ", 备注: " + remark;
            }
            operationLogService.saveLog(Constants.BIZ_TYPE_TASK, taskId,
                Constants.OP_TYPE_STATUS_CHANGE, logContent);
        }
        return result;
    }

    public boolean canTransition(Long taskId, String targetStatus) {
        HarvestTask task = getById(taskId);
        if (task == null) {
            return false;
        }
        return TaskStatusEnum.isValidTransition(task.getTaskStatus(), targetStatus);
    }
}