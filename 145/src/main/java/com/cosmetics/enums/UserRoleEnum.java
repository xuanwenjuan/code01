package com.cosmetics.enums;

import lombok.Getter;

@Getter
public enum UserRoleEnum {

    MATERIAL_PURCHASER(1, "原料采购"),
    FORMULA_DEVELOPER(2, "配方研发"),
    PRODUCTION_LEADER(3, "生产组长"),
    QUALITY_INSPECTOR(4, "品控员"),
    WAREHOUSE_ADMIN(5, "仓储管理员");

    private final Integer code;
    private final String desc;

    UserRoleEnum(Integer code, String desc) {
        this.code = code;
        this.desc = desc;
    }

    public static UserRoleEnum getByCode(Integer code) {
        for (UserRoleEnum value : values()) {
            if (value.getCode().equals(code)) {
                return value;
            }
        }
        return null;
    }
}
