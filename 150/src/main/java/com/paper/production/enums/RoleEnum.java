package com.paper.production.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum RoleEnum {

    ADMIN("ADMIN", "系统管理员"),
    PURCHASE("PURCHASE", "采购员"),
    PROCESS("PROCESS", "工艺设计师"),
    PRODUCTION("PRODUCTION", "产线管理员"),
    QUALITY("QUALITY", "质量巡检员");

    private final String code;
    private final String name;

    public static RoleEnum getByCode(String code) {
        for (RoleEnum role : values()) {
            if (role.getCode().equals(code)) {
                return role;
            }
        }
        return null;
    }
}
