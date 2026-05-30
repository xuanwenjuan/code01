package com.snacktrace.enums;

import lombok.Getter;

@Getter
public enum WorkOrderStatusEnum {
    PENDING(1, "待开始"),
    CLEANING(2, "筛选清洗中"),
    MARINATING(3, "入味腌制中"),
    BAKING(4, "烘烤炒制中"),
    STERILIZING(5, "杀菌处理中"),
    PACKING(6, "分装打包中"),
    LABELING(7, "贴标中"),
    COMPLETED(8, "已完成"),
    SHELVED(9, "已搁置");

    private final Integer code;
    private final String desc;

    WorkOrderStatusEnum(Integer code, String desc) {
        this.code = code;
        this.desc = desc;
    }

    public static WorkOrderStatusEnum getNextStatus(Integer currentCode) {
        if (currentCode == null) return PENDING;
        return switch (currentCode) {
            case 1 -> CLEANING;
            case 2 -> MARINATING;
            case 3 -> BAKING;
            case 4 -> STERILIZING;
            case 5 -> PACKING;
            case 6 -> LABELING;
            case 7 -> COMPLETED;
            default -> null;
        };
    }
}
