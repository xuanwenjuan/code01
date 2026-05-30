package com.hydraulic.piston.common;

import lombok.Getter;

@Getter
public enum RoleEnum {
    ADMIN(1, "超级管理员"),
    MATERIAL_PURCHASER(2, "原料采购员"),
    MACHINING_TECHNICIAN(3, "机加工工艺员"),
    CNC_TEAM_LEADER(4, "数控班组组长"),
    QUALITY_INSPECTOR(5, "尺寸质检专员");

    private final Integer roleId;
    private final String roleName;

    RoleEnum(Integer roleId, String roleName) {
        this.roleId = roleId;
        this.roleName = roleName;
    }
}
