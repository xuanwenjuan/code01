package com.hydraulic.piston.common;

import lombok.Getter;

@Getter
public enum StockStatusEnum {

    ADEQUATE(1, "库存充足"),
    WARNING(2, "库存预警"),
    LOCKED(3, "已锁定"),
    OUT_OF_STOCK(4, "已出库"),
    STOPPED(5, "停止采购");

    private final Integer code;
    private final String desc;

    StockStatusEnum(Integer code, String desc) {
        this.code = code;
        this.desc = desc;
    }

    public static String getDescByCode(Integer code) {
        for (StockStatusEnum statusEnum : values()) {
            if (statusEnum.getCode().equals(code)) {
                return statusEnum.getDesc();
            }
        }
        return "";
    }
}