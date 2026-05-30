package com.instrument.consignment.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ShareStatusEnum {

    PENDING("PENDING", "待结算"),
    SETTLED("SETTLED", "已结算"),
    CANCELLED("CANCELLED", "已取消");

    private final String code;
    private final String desc;

    public static String getDescByCode(String code) {
        for (ShareStatusEnum value : values()) {
            if (value.getCode().equals(code)) {
                return value.getDesc();
            }
        }
        return code;
    }
}
