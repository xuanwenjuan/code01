package com.mushroom.traceability.enums;

import lombok.Getter;

import java.util.Arrays;
import java.util.List;

@Getter
public enum TaskStatusEnum {
    PENDING("PENDING", "待派发", Arrays.asList()),
    ASSIGNED("ASSIGNED", "已派发", Arrays.asList("PENDING")),
    COLLECTING("COLLECTING", "采集中", Arrays.asList("ASSIGNED")),
    QUALITY_CHECK("QUALITY_CHECK", "质检中", Arrays.asList("COLLECTING")),
    WAREHOUSE("WAREHOUSE", "已入库", Arrays.asList("QUALITY_CHECK")),
    SHIPPED("SHIPPED", "已发货", Arrays.asList("WAREHOUSE")),
    EXPIRED("EXPIRED", "已失效", Arrays.asList("PENDING", "ASSIGNED", "COLLECTING")),
    CANCELLED("CANCELLED", "已取消", Arrays.asList("PENDING", "ASSIGNED", "COLLECTING", "QUALITY_CHECK", "WAREHOUSE"));

    private final String code;
    private final String desc;
    private final List<String> allowedPreviousStates;

    TaskStatusEnum(String code, String desc, List<String> allowedPreviousStates) {
        this.code = code;
        this.desc = desc;
        this.allowedPreviousStates = allowedPreviousStates;
    }

    public boolean canTransitionFrom(String previousState) {
        return allowedPreviousStates.contains(previousState);
    }

    public static boolean isValidTransition(String from, String to) {
        for (TaskStatusEnum status : values()) {
            if (status.getCode().equals(to)) {
                return status.canTransitionFrom(from);
            }
        }
        return false;
    }

    public static String getDesc(String code) {
        for (TaskStatusEnum status : values()) {
            if (status.getCode().equals(code)) {
                return status.getDesc();
            }
        }
        return "";
    }
}