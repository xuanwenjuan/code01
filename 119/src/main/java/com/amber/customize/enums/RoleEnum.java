package com.amber.customize.enums;

import lombok.Getter;

@Getter
public enum RoleEnum {

    ROLE_SELECTOR(1, "原石甄选员"),
    ROLE_CARVER(2, "玉雕师傅"),
    ROLE_WAREHOUSE(3, "仓储管理员"),
    ROLE_ADMIN(4, "平台管理员");

    private final Integer code;
    private final String desc;

    RoleEnum(Integer code, String desc) {
        this.code = code;
        this.desc = desc;
    }

    public static RoleEnum getByCode(Integer code) {
        for (RoleEnum role : values()) {
            if (role.getCode().equals(code)) {
                return role;
            }
        }
        return null;
    }

    public static String getDescByCode(Integer code) {
        if (code == null) {
            return "";
        }
        RoleEnum role = getByCode(code);
        return role != null ? role.getDesc() : "";
    }

}
