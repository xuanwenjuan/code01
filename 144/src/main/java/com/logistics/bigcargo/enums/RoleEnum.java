package com.logistics.bigcargo.enums;

import lombok.Getter;

@Getter
public enum RoleEnum {
    WAREHOUSE_ADMIN("WAREHOUSE_ADMIN", "仓储管理员"),
    SORTER("SORTER", "分拣专员"),
    DISPATCHER("DISPATCHER", "调度员"),
    DRIVER("DRIVER", "配送员");

    private final String code;
    private final String desc;

    RoleEnum(String code, String desc) {
        this.code = code;
        this.desc = desc;
    }

    public static String getDesc(String code) {
        for (RoleEnum role : values()) {
            if (role.getCode().equals(code)) {
                return role.getDesc();
            }
        }
        return "未知角色";
    }
}
