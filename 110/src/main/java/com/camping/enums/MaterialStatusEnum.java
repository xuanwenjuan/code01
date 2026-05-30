package com.camping.enums;

import lombok.Getter;

@Getter
public enum MaterialStatusEnum {
    SUFFICIENT(1, "充足备货"),
    TIGHT(2, "库存紧张"),
    OUT_OF_STOCK(3, "停采断货");

    private final Integer code;
    private final String desc;

    MaterialStatusEnum(Integer code, String desc) {
        this.code = code;
        this.desc = desc;
    }
}
