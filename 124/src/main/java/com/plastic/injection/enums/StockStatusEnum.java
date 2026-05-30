package com.plastic.injection.enums;

import lombok.Getter;

@Getter
public enum StockStatusEnum {

    SUFFICIENT(1, "库存充足"),
    WARNING(2, "库存预警"),
    STOP_PURCHASE(3, "停止采购");

    private final Integer code;
    private final String desc;

    StockStatusEnum(Integer code, String desc) {
        this.code = code;
        this.desc = desc;
    }
}
