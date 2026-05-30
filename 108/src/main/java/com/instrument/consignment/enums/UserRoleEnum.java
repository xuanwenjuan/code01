package com.instrument.consignment.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum UserRoleEnum {

    ADMIN("ADMIN", "平台管理员"),
    ESTIMATOR("ESTIMATOR", "估价专员"),
    WAREHOUSE("WAREHOUSE", "仓储管理员"),
    CRAFTSMAN("CRAFTSMAN", "翻新匠人");

    private final String code;
    private final String desc;

    public static UserRoleEnum getByCode(String code) {
        for (UserRoleEnum value : values()) {
            if (value.getCode().equals(code)) {
                return value;
            }
        }
        return null;
    }
}
