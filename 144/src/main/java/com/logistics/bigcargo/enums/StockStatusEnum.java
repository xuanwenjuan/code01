package com.logistics.bigcargo.enums;

import lombok.Getter;

@Getter
public enum StockStatusEnum {
    NORMAL(1, "正常库存"),
    PENDING_SORT(2, "待分拣库存"),
    NEAR_EXPIRE(3, "临期调拨"),
    SORTING(4, "分拣中"),
    DISPATCHED(5, "已出库");

    private final Integer code;
    private final String desc;

    StockStatusEnum(Integer code, String desc) {
        this.code = code;
        this.desc = desc;
    }

    public static String getDesc(Integer code) {
        for (StockStatusEnum status : values()) {
            if (status.getCode().equals(code)) {
                return status.getDesc();
            }
        }
        return "未知状态";
    }
}
