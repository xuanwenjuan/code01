package com.snacktrace.enums;

import lombok.Getter;

@Getter
public enum MaterialStatusEnum {
    SUFFICIENT(1, "库存充足"),
    WARNING(2, "库存预警"),
    SUSPEND(3, "暂停采购");

    private final Integer code;
    private final String desc;

    MaterialStatusEnum(Integer code, String desc) {
        this.code = code;
        this.desc = desc;
    }
}
