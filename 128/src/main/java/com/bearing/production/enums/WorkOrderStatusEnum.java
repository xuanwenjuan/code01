package com.bearing.production.enums;

import lombok.Getter;

@Getter
public enum WorkOrderStatusEnum {
    CREATED(0, "已创建"),
    PENDING(1, "待投产"),
    CUTTING(2, "圆钢切断下料"),
    PREHEATING(3, "中频预热处理"),
    FORGING(4, "闭式冷锻成型"),
    TRIMMING(5, "精整修边"),
    HEAT_TREATMENT(6, "热处理调质"),
    GRINDING(7, "精密研磨分选"),
    FINISHED(8, "成品入库"),
    SUSPENDED(9, "已暂停"),
    CANCELLED(10, "已取消");

    private final Integer code;
    private final String name;

    WorkOrderStatusEnum(Integer code, String name) {
        this.code = code;
        this.name = name;
    }

    public static WorkOrderStatusEnum getNextStatus(Integer currentCode) {
        return switch (currentCode) {
            case 0 -> PENDING;
            case 1 -> CUTTING;
            case 2 -> PREHEATING;
            case 3 -> FORGING;
            case 4 -> TRIMMING;
            case 5 -> HEAT_TREATMENT;
            case 6 -> GRINDING;
            case 7 -> FINISHED;
            default -> null;
        };
    }

    public static String getStatusName(Integer statusCode) {
        if (statusCode == null) return "未知状态";
        for (WorkOrderStatusEnum statusEnum : values()) {
            if (statusEnum.getCode().equals(statusCode)) {
                return statusEnum.getName();
            }
        }
        return "未知状态";
    }
}
