package com.snack.processing.common.enums;

import lombok.Getter;

@Getter
public enum WorkOrderStatusEnum {

    PENDING(1, "待生产"),
    IN_PRODUCTION(2, "生产中"),
    PAUSED(3, "已暂停"),
    QC_INSPECTION(4, "质检中"),
    COMPLETED(5, "已完成"),
    CANCELLED(6, "已取消");

    private final Integer code;
    private final String description;

    WorkOrderStatusEnum(Integer code, String description) {
        this.code = code;
        this.description = description;
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
