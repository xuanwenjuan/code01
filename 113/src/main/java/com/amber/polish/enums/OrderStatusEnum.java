package com.amber.polish.enums;

import lombok.Getter;

@Getter
public enum OrderStatusEnum {

    PENDING("PENDING", "待选石"),
    DESIGN("DESIGN", "设计确认中"),
    GRINDING("GRINDING", "粗磨去皮"),
    POLISHING("POLISHING", "精抛修边"),
    INLAY("INLAY", "镶嵌配饰"),
    DELIVERED("DELIVERED", "成品交付"),
    CANCELLED("CANCELLED", "已取消"),
    SHELVED("SHELVED", "已搁置");

    private final String code;
    private final String desc;

    OrderStatusEnum(String code, String desc) {
        this.code = code;
        this.desc = desc;
    }
}
