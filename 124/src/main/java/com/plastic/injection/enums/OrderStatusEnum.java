package com.plastic.injection.enums;

import lombok.Getter;

@Getter
public enum OrderStatusEnum {

    PENDING(1, "待投产"),
    DRYING(2, "烘干拌料中"),
    MOLD_INSTALL(3, "模具安装调试中"),
    INJECTION(4, "注塑成型中"),
    COOLING(5, "水冷冷却中"),
    TRIMMING(6, "修边去废中"),
    QUALITY_CHECK(7, "质检中"),
    FINISHED(8, "已完成"),
    DELAYED(9, "已延期");

    private final Integer code;
    private final String desc;

    OrderStatusEnum(Integer code, String desc) {
        this.code = code;
        this.desc = desc;
    }
}
