package com.radiator.management.common;

import lombok.Getter;

@Getter
public enum RoleEnum {
    PURCHASE_OFFICER("purchase_officer", "采购专员"),
    ASSEMBLY_TECHNICIAN("assembly_technician", "组装工艺员"),
    PRODUCTION_LEADER("production_leader", "产线组长"),
    QUALITY_INSPECTOR("quality_inspector", "成品质检员");

    private final String code;
    private final String desc;

    RoleEnum(String code, String desc) {
        this.code = code;
        this.desc = desc;
    }
}