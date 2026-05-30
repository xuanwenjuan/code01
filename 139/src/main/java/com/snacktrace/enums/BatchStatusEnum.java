package com.snacktrace.enums;

import lombok.Getter;

@Getter
public enum BatchStatusEnum {
    IN_STOCK(1, "在库"),
    IN_USE(2, "使用中"),
    USED_UP(3, "已用完"),
    EXPIRED(4, "已过期");

    private final Integer code;
    private final String desc;

    BatchStatusEnum(Integer code, String desc) {
        this.code = code;
        this.desc = desc;
    }
}
