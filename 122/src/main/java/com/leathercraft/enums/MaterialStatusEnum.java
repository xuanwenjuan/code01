package com.leathercraft.enums;

import lombok.Getter;

@Getter
public enum MaterialStatusEnum {
    SUFFICIENT("SUFFICIENT", "库存充足"),
    WARNING("WARNING", "库存预警"),
    LOCKED("LOCKED", "已锁定"),
    STOPPED("STOPPED", "停止采购");

    private final String code;
    private final String desc;

    MaterialStatusEnum(String code, String desc) {
        this.code = code;
        this.desc = desc;
    }

    public static String getDescByCode(String code) {
        for (MaterialStatusEnum e : values()) {
            if (e.getCode().equals(code)) {
                return e.getDesc();
            }
        }
        return "未知";
    }
}
