package com.paper.production.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum MaterialStatusEnum {

    NORMAL(1, "正常库存"),
    WARNING(2, "库存预警"),
    SUSPEND(3, "暂停采购");

    private final Integer code;
    private final String name;

    public static MaterialStatusEnum getByCode(Integer code) {
        for (MaterialStatusEnum status : values()) {
            if (status.getCode().equals(code)) {
                return status;
            }
        }
        return null;
    }
}
