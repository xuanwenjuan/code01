package com.ancientpaper.enums;

import lombok.Getter;

@Getter
public enum MaterialStatusEnum {
    ADEQUATE(1, "库存充足"),
    WARNING(2, "库存预警"),
    OUT_OF_STOCK(3, "缺货停收"),
    LOCKED(4, "已锁定");

    private final Integer code;
    private final String desc;

    MaterialStatusEnum(Integer code, String desc) {
        this.code = code;
        this.desc = desc;
    }
}
