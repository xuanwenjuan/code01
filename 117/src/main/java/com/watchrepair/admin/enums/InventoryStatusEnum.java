package com.watchrepair.admin.enums;

import lombok.Getter;

@Getter
public enum InventoryStatusEnum {

    SUFFICIENT(1, "库存充足"),
    WARNING(2, "库存预警"),
    OUT_OF_STOCK(3, "停产断货");

    private final Integer code;
    private final String desc;

    InventoryStatusEnum(Integer code, String desc) {
        this.code = code;
        this.desc = desc;
    }

    public static InventoryStatusEnum getByCode(Integer code) {
        for (InventoryStatusEnum status : values()) {
            if (status.getCode().equals(code)) {
                return status;
            }
        }
        return null;
    }

    public static InventoryStatusEnum calculateStatus(Integer quantity, Integer warningThreshold) {
        if (quantity == null || quantity <= 0) {
            return OUT_OF_STOCK;
        }
        if (warningThreshold != null && quantity <= warningThreshold) {
            return WARNING;
        }
        return SUFFICIENT;
    }
}