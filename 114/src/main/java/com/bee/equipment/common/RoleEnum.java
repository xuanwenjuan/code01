package com.bee.equipment.common;

import lombok.Getter;

@Getter
public enum RoleEnum {

    ADMIN("ADMIN", "平台管理员"),
    ASSEMBLER("ASSEMBLER", "器具组装工"),
    PURCHASER("PURCHASER", "物料采购"),
    OPERATOR("OPERATOR", "蜂场运维");

    private final String code;
    private final String desc;

    RoleEnum(String code, String desc) {
        this.code = code;
        this.desc = desc;
    }
}
