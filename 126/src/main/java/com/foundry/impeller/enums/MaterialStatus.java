package com.foundry.impeller.enums;

import lombok.Getter;

@Getter
public enum MaterialStatus {
    NORMAL("NORMAL", "库存充足"),
    WARNING("WARNING", "库存预警"),
    STOP("STOP", "停止采购");

    private final String code;
    private final String desc;

    MaterialStatus(String code, String desc) {
        this.code = code;
        this.desc = desc;
    }
}
