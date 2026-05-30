package com.aromatherapy.enums;

import lombok.Getter;

@Getter
public enum UserRoleEnum {

    ADMIN("ADMIN", "管理员"),
    PERFUMER("PERFUMER", "调香师"),
    BUYER("BUYER", "原料采购员"),
    WAREHOUSE("WAREHOUSE", "仓储员"),
    OPERATOR("OPERATOR", "渠道运营");

    private final String code;
    private final String desc;

    UserRoleEnum(String code, String desc) {
        this.code = code;
        this.desc = desc;
    }
}
