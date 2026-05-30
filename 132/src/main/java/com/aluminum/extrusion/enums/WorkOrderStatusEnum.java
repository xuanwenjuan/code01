package com.aluminum.extrusion.enums;

import lombok.Getter;

@Getter
public enum WorkOrderStatusEnum {
    PENDING(1, "待生产"),
    PREHEATING(2, "加温预热中"),
    EXTRUDING(3, "挤压成型中"),
    COOLING(4, "水冷调直中"),
    CUTTING(5, "定尺切割中"),
    FINISH_CUTTING(6, "端面精切中"),
    OXIDIZING(7, "表面氧化处理中"),
    SORTING(8, "成品分拣入库中"),
    COMPLETED(9, "已完成"),
    PAUSED(10, "已暂停");

    private final Integer code;
    private final String description;

    WorkOrderStatusEnum(Integer code, String description) {
        this.code = code;
        this.description = description;
    }

    public static WorkOrderStatusEnum getNextStatus(Integer currentCode) {
        WorkOrderStatusEnum current = getByCode(currentCode);
        if (current == null || current == PAUSED || current == COMPLETED) {
            return null;
        }
        int nextCode = currentCode + 1;
        if (nextCode > COMPLETED.code) {
            return COMPLETED;
        }
        return getByCode(nextCode);
    }

    public static WorkOrderStatusEnum getByCode(Integer code) {
        for (WorkOrderStatusEnum status : values()) {
            if (status.getCode().equals(code)) {
                return status;
            }
        }
        return null;
    }
}
