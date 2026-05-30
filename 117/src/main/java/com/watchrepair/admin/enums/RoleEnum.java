package com.watchrepair.admin.enums;

import lombok.Getter;

@Getter
public enum RoleEnum {

    PARTS_SELECTOR(1, "零件选配员"),
    REPAIR_TECHNICIAN(2, "修表技师"),
    COLLECTION_ADMIN(3, "藏品管理员"),
    PLATFORM_ADMIN(4, "平台管理员");

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
}