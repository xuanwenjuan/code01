package com.leathercraft.enums;

import lombok.Getter;

@Getter
public enum MaterialTypeEnum {
    COWHIDE("COWHIDE", "牛皮"),
    SHEEPSKIN("SHEEPSKIN", "羊皮"),
    GOATSKIN("GOATSKIN", "山羊皮"),
    PIGSKIN("PIGSKIN", "猪皮"),
    TANNING_AGENT("TANNING_AGENT", "鞣制剂"),
    GREASE("GREASE", "油脂"),
    HARDWARE("HARDWARE", "五金配件"),
    THREAD("THREAD", "缝线");

    private final String code;
    private final String desc;

    MaterialTypeEnum(String code, String desc) {
        this.code = code;
        this.desc = desc;
    }

    public static String getDescByCode(String code) {
        for (MaterialTypeEnum e : values()) {
            if (e.getCode().equals(code)) {
                return e.getDesc();
            }
        }
        return "未知";
    }
}
