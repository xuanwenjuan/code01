package com.watchrepair.admin.enums;

import lombok.Getter;

@Getter
public enum CategoryStatusEnum {

    NORMAL(1, "正常"),
    DISCONTINUED(2, "停产停修");

    private final Integer code;
    private final String desc;

    CategoryStatusEnum(Integer code, String desc) {
        this.code = code;
        this.desc = desc;
    }

    public static CategoryStatusEnum getByCode(Integer code) {
        for (CategoryStatusEnum status : values()) {
            if (status.getCode().equals(code)) {
                return status;
            }
        }
        return null;
    }
}