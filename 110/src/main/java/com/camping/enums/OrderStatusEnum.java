package com.camping.enums;

import lombok.Getter;

@Getter
public enum OrderStatusEnum {
    PENDING_GROUP(1, "待成团"),
    CONFIRM_REQUIREMENT(2, "确认定制需求"),
    PREPARE_MATERIAL(3, "物料备货中"),
    SHIPPED(4, "已发货"),
    COMPLETED(5, "已完成"),
    EXPIRED(6, "已失效"),
    REFUNDING(7, "售后退换中");

    private final Integer code;
    private final String desc;

    OrderStatusEnum(Integer code, String desc) {
        this.code = code;
        this.desc = desc;
    }
}
