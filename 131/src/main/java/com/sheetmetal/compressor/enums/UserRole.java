package com.sheetmetal.compressor.enums;

import lombok.Getter;

@Getter
public enum UserRole {
    PURCHASER(1, "原料采购"),
    PROCESS_ENGINEER(2, "钣金工艺员"),
    PRODUCTION_LEADER(3, "产线组长"),
    QUALITY_INSPECTOR(4, "成品质检员"),
    ADMIN(99, "管理员");

    private final Integer code;
    private final String desc;

    UserRole(Integer code, String desc) {
        this.code = code;
        this.desc = desc;
    }

    public static UserRole fromCode(Integer code) {
        for (UserRole role : values()) {
            if (role.getCode().equals(code)) {
                return role;
            }
        }
        return null;
    }
}
