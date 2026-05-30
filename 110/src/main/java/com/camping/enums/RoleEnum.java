package com.camping.enums;

import lombok.Getter;

@Getter
public enum RoleEnum {
    ADMIN(1, "平台管理员"),
    OPERATION(2, "运营选品"),
    WAREHOUSE(3, "仓储备货"),
    LEADER(4, "分销团长");

    private final Integer code;
    private final String desc;

    RoleEnum(Integer code, String desc) {
        this.code = code;
        this.desc = desc;
    }
}
