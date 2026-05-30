package com.instrument.consignment.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum WorkOrderStatusEnum {

    PENDING("PENDING", "待估价"),
    ESTIMATING("ESTIMATING", "估价中"),
    ESTIMATED("ESTIMATED", "已估价待确认"),
    SHELVED("SHELVED", "已搁置"),
    REFURBISHING("REFURBISHING", "翻新中"),
    COMPLETED("COMPLETED", "已完工"),
    CANCELLED("CANCELLED", "已取消");

    private final String code;
    private final String desc;

    public static WorkOrderStatusEnum getByCode(String code) {
        for (WorkOrderStatusEnum value : values()) {
            if (value.getCode().equals(code)) {
                return value;
            }
        }
        return null;
    }
}
