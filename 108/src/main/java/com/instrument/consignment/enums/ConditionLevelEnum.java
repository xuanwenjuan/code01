package com.instrument.consignment.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ConditionLevelEnum {

    EXCELLENT("EXCELLENT", "优秀"),
    GOOD("GOOD", "良好"),
    FAIR("FAIR", "一般"),
    POOR("POOR", "较差");

    private final String code;
    private final String desc;

    public static ConditionLevelEnum getByCode(String code) {
        for (ConditionLevelEnum value : values()) {
            if (value.getCode().equals(code)) {
                return value;
            }
        }
        return null;
    }
}
