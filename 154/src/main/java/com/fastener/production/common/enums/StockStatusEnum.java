package com.fastener.production.common.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum StockStatusEnum {

    NORMAL(1, "正常库存"),
    WARNING(2, "库存预警"),
    STOP_PURCHASE(3, "停止采购");

    private final Integer code;
    private final String name;
}
