package com.foundry.impeller.enums;

import lombok.Getter;

@Getter
public enum UserRole {
    ADMIN("ADMIN", "系统管理员"),
    PURCHASER("PURCHASER", "物料采购员"),
    PROCESS("PROCESS", "铸造工艺员"),
    TEAM_LEADER("TEAM_LEADER", "生产班组长"),
    INSPECTOR("INSPECTOR", "品质巡检员");

    private final String code;
    private final String desc;

    UserRole(String code, String desc) {
        this.code = code;
        this.desc = desc;
    }
}
