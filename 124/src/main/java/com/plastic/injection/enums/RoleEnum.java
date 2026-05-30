package com.plastic.injection.enums;

import lombok.Getter;

@Getter
public enum RoleEnum {

    PURCHASER(1, "原料采购员"),
    TECHNICIAN(2, "注塑技术员"),
    GROUP_LEADER(3, "生产组长"),
    QUALITY_ADMIN(4, "质检管理员"),
    ADMIN(5, "系统管理员");

    private final Integer code;
    private final String desc;

    RoleEnum(Integer code, String desc) {
        this.code = code;
        this.desc = desc;
    }
}
