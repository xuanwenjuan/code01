package com.camping.enums;

import lombok.Getter;

@Getter
public enum MaterialTypeEnum {
    FABRIC(1, "面料材质"),
    HARDWARE(2, "五金配件"),
    LOGO(3, "定制LOGO耗材"),
    ACCESSORY(4, "配件规格参数");

    private final Integer code;
    private final String desc;

    MaterialTypeEnum(Integer code, String desc) {
        this.code = code;
        this.desc = desc;
    }
}
