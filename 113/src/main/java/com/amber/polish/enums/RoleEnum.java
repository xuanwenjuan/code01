package com.amber.polish.enums;

import lombok.Getter;

@Getter
public enum RoleEnum {

    PURCHASER("PURCHASER", "原石采购员"),
    POLISHER("POLISHER", "打磨技师"),
    CONSULTANT("CONSULTANT", "定制顾问"),
    ADMIN("ADMIN", "平台管理员");

    private final String code;
    private final String desc;

    RoleEnum(String code, String desc) {
        this.code = code;
        this.desc = desc;
    }

    public static RoleEnum getByCode(String code) {
        for (RoleEnum role : values()) {
            if (role.getCode().equals(code)) {
                return role;
            }
        }
        return null;
    }
}
