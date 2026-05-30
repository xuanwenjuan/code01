package com.aluminum.extrusion.enums;

import lombok.Getter;

@Getter
public enum MaterialTypeEnum {
    AL_6063(1, "6063国标铝棒"),
    AL_6061(2, "6061工业铝棒"),
    PURE_ALLOY(3, "高纯合金铝坯"),
    SURFACE_AID(4, "表面处理助剂");

    private final Integer code;
    private final String description;

    MaterialTypeEnum(Integer code, String description) {
        this.code = code;
        this.description = description;
    }
}
