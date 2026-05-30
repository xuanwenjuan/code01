package com.aluminum.extrusion.enums;

import lombok.Getter;

@Getter
public enum RoleEnum {
    PURCHASER(1, "原料采购员"),
    PROCESS_ENGINEER(2, "挤压工艺员"),
    TEAM_LEADER(3, "产线班组长"),
    QUALITY_INSPECTOR(4, "成品质检员"),
    ADMIN(5, "管理员");

    private final Integer code;
    private final String description;

    RoleEnum(Integer code, String description) {
        this.code = code;
        this.description = description;
    }

    public static RoleEnum getByCode(Integer code) {
        for (RoleEnum role : values()) {
            if (role.getCode().equals(code)) {
                return role;
            }
        }
        return null;
    }
}
