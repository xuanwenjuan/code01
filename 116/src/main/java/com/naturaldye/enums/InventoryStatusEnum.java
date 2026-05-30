package com.naturaldye.enums;

import com.baomidou.mybatisplus.annotation.EnumValue;
import lombok.Getter;

@Getter
public enum InventoryStatusEnum {
    SUFFICIENT(1, "库存充足"),
    WARNING(2, "库存预警"),
    STOP_PURCHASE(3, "停止采购");

    @EnumValue
    private final Integer code;
    private final String desc;

    InventoryStatusEnum(Integer code, String desc) {
        this.code = code;
        this.desc = desc;
    }
}
