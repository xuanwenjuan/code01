package com.logistics.bigcargo.enums;

import lombok.Getter;

@Getter
public enum BearingLevelEnum {
    LIGHT(1, "轻型", "0-1吨"),
    MEDIUM(2, "中型", "1-5吨"),
    HEAVY(3, "重型", "5-15吨"),
    SUPER_HEAVY(4, "超重型", "15吨以上");

    private final Integer code;
    private final String desc;
    private final String weightRange;

    BearingLevelEnum(Integer code, String desc, String weightRange) {
        this.code = code;
        this.desc = desc;
        this.weightRange = weightRange;
    }

    public static String getDesc(Integer code) {
        for (BearingLevelEnum level : values()) {
            if (level.getCode().equals(code)) {
                return level.getDesc();
            }
        }
        return "未知等级";
    }
}
