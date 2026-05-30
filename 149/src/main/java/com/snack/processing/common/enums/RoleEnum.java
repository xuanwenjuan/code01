package com.snack.processing.common.enums;

import lombok.Getter;

@Getter
public enum RoleEnum {

    PURCHASER(1, "PURCHASER", "采购员"),
    PROCESS_ENGINEER(2, "PROCESS_ENGINEER", "工艺员"),
    PRODUCTION_LEADER(3, "PRODUCTION_LEADER", "生产组长"),
    QC_INSPECTOR(4, "QC_INSPECTOR", "品控员"),
    ADMIN(5, "ADMIN", "管理员");

    private final Integer code;
    private final String roleName;
    private final String description;

    RoleEnum(Integer code, String roleName, String description) {
        this.code = code;
        this.roleName = roleName;
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

    public static RoleEnum getByRoleName(String roleName) {
        for (RoleEnum role : values()) {
            if (role.getRoleName().equals(roleName)) {
                return role;
            }
        }
        return null;
    }
}
