package com.aromatherapy.util;

import com.aromatherapy.enums.WorkOrderStatusEnum;
import com.aromatherapy.exception.BusinessException;
import lombok.extern.slf4j.Slf4j;
import java.util.Set;

@Slf4j
public class WorkOrderStatusFlow {

    public static void validateStatusTransition(WorkOrderStatusEnum currentStatus, WorkOrderStatusEnum targetStatus) {
        if (currentStatus == null) {
            throw new BusinessException("当前状态不能为空");
        }

        boolean isValid = switch (currentStatus) {
            case PENDING -> Set.of(WorkOrderStatusEnum.FORMULA_CONFIRMED, WorkOrderStatusEnum.SUSPENDED, WorkOrderStatusEnum.CANCELLED).contains(targetStatus);
            case FORMULA_CONFIRMED -> Set.of(WorkOrderStatusEnum.MIXING, WorkOrderStatusEnum.SUSPENDED, WorkOrderStatusEnum.CANCELLED).contains(targetStatus);
            case MIXING -> Set.of(WorkOrderStatusEnum.AGING, WorkOrderStatusEnum.SUSPENDED, WorkOrderStatusEnum.CANCELLED).contains(targetStatus);
            case AGING -> Set.of(WorkOrderStatusEnum.QC_PASSED, WorkOrderStatusEnum.QC_FAILED, WorkOrderStatusEnum.SUSPENDED, WorkOrderStatusEnum.CANCELLED).contains(targetStatus);
            case QC_PASSED -> Set.of(WorkOrderStatusEnum.PACKAGED, WorkOrderStatusEnum.SUSPENDED, WorkOrderStatusEnum.CANCELLED).contains(targetStatus);
            case QC_FAILED -> Set.of(WorkOrderStatusEnum.MIXING, WorkOrderStatusEnum.CANCELLED).contains(targetStatus);
            case PACKAGED -> Set.of(WorkOrderStatusEnum.SHIPPED, WorkOrderStatusEnum.SUSPENDED, WorkOrderStatusEnum.CANCELLED).contains(targetStatus);
            case SHIPPED, CANCELLED -> false;
            case SUSPENDED -> Set.of(WorkOrderStatusEnum.PENDING, WorkOrderStatusEnum.FORMULA_CONFIRMED, WorkOrderStatusEnum.MIXING, WorkOrderStatusEnum.CANCELLED).contains(targetStatus);
        };

        if (!isValid) {
            throw new BusinessException("不允许的状态流转: " + currentStatus.getDesc() + " -> " + targetStatus.getDesc());
        }

        log.info("状态流转校验通过: {} -> {}", currentStatus.getDesc(), targetStatus.getDesc());
    }

    public static boolean canTransition(WorkOrderStatusEnum currentStatus, WorkOrderStatusEnum targetStatus) {
        try {
            validateStatusTransition(currentStatus, targetStatus);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public static boolean isTerminatedStatus(WorkOrderStatusEnum status) {
        return Set.of(WorkOrderStatusEnum.SHIPPED, WorkOrderStatusEnum.CANCELLED).contains(status);
    }
}
