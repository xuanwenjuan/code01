package com.leathercraft.enums;

import lombok.Getter;

@Getter
public enum RoleEnum {
    PURCHASER("PURCHASER", "皮料采购员"),
    TANNER("TANNER", "鞣制师傅"),
    CUTTER("CUTTER", "裁剪技工"),
    ADMIN("ADMIN", "平台管理员");

    private final String code;
    private final String desc;

    RoleEnum(String code, String desc) {
        this.code = code;
        this.desc = desc;
    }
}
