package com.snacktrace.enums;

import lombok.Getter;

@Getter
public enum MaterialTypeEnum {
    NUT(1, "坚果果仁"),
    MEAT(2, "生鲜肉类"),
    FRUIT(3, "食用果蔬"),
    SEASONING(4, "调味辅料");

    private final Integer code;
    private final String desc;

    MaterialTypeEnum(Integer code, String desc) {
        this.code = code;
        this.desc = desc;
    }
}
