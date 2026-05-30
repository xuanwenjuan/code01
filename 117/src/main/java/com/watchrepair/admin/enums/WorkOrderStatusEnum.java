package com.watchrepair.admin.enums;

import lombok.Getter;

@Getter
public enum WorkOrderStatusEnum {

    RECEIVED(1, "藏品接收鉴定"),
    DISASSEMBLING(2, "故障拆解检测"),
    PARTS_REPLACING(3, "零件更换适配"),
    ADJUSTING(4, "调校走时精度"),
    POLISHING(5, "外观抛光复原"),
    COMPLETED(6, "完工交付验收"),
    CANCELLED(7, "已取消");

    private final Integer code;
    private final String desc;

    WorkOrderStatusEnum(Integer code, String desc) {
        this.code = code;
        this.desc = desc;
    }

    public static WorkOrderStatusEnum getByCode(Integer code) {
        for (WorkOrderStatusEnum status : values()) {
            if (status.getCode().equals(code)) {
                return status;
            }
        }
        return null;
    }

    public static WorkOrderStatusEnum getNextStatus(Integer currentCode) {
        if (currentCode == null || currentCode >= 6) {
            return null;
        }
        return getByCode(currentCode + 1);
    }
}