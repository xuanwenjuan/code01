package com.instrument.consignment.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum CategoryTypeEnum {

    STRING("STRING", "弦乐器"),
    WIND("WIND", "吹奏乐器"),
    PERCUSSION("PERCUSSION", "打击乐器"),
    CLASSIC("CLASSIC", "小众古典乐器");

    private final String code;
    private final String desc;

    public static CategoryTypeEnum getByCode(String code) {
        for (CategoryTypeEnum value : values()) {
            if (value.getCode().equals(code)) {
                return value;
            }
        }
        return null;
    }
}
