package com.paper.production.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum WorkOrderStatusEnum {

    PENDING(1, "待排产"),
    SCHEDULED(2, "已排产"),
    CUTTING(3, "裁切分条"),
    CORRUGATING(4, "瓦楞裱合"),
    DIE_CUTTING(5, "模切成型"),
    PRINTING(6, "彩色印刷"),
    GLUING(7, "粘合折叠"),
    INSPECTING(8, "外观质检"),
    PACKING(9, "成品打包"),
    FINISHED(10, "已完成"),
    SUSPENDED(11, "已搁置"),
    CANCELLED(12, "已取消");

    private final Integer code;
    private final String name;

    public static WorkOrderStatusEnum getByCode(Integer code) {
        for (WorkOrderStatusEnum status : values()) {
            if (status.getCode().equals(code)) {
                return status;
            }
        }
        return null;
    }

    public static WorkOrderStatusEnum getNextStatus(Integer currentCode) {
        WorkOrderStatusEnum current = getByCode(currentCode);
        if (current == null) {
            return null;
        }
        int nextCode = currentCode + 1;
        if (nextCode > PACKING.code) {
            return FINISHED;
        }
        return getByCode(nextCode);
    }
}
