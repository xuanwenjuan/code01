package com.amber.customize.enums;

import lombok.Getter;

@Getter
public enum RawStatusEnum {

    SUFFICIENT(1, "货源充足"),
    SHORT(2, "货源紧缺"),
    OUT_OF_STOCK(3, "绝矿断货");

    private final Integer code;
    private final String desc;

    RawStatusEnum(Integer code, String desc) {
        this.code = code;
        this.desc = desc;
    }

    public static String getDescByCode(Integer code) {
        if (code == null) {
            return "";
        }
        for (RawStatusEnum e : values()) {
            if (e.getCode().equals(code)) {
                return e.getDesc();
            }
        }
        return "";
    }

}
