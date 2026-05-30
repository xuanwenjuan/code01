package com.snacktrace.enums;

import lombok.Getter;

@Getter
public enum RoleEnum {
    ADMIN(0, "系统管理员"),
    PURCHASER(1, "原料采购员"),
    R_D(2, "配方研发员"),
    TEAM_LEADER(3, "生产班组长"),
    QC_INSPECTOR(4, "品控巡检员");

    private final Integer code;
    private final String desc;

    RoleEnum(Integer code, String desc) {
        this.code = code;
        this.desc = desc;
    }
}
