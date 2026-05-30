package com.amber.customize.enums;

import lombok.Getter;

@Getter
public enum OrderStatusEnum {

    PENDING_CONFIRM(1, "待客户确认题材"),
    DESIGN_DRAWING(2, "图纸定稿设计中"),
    PEELING_SHAPING(3, "粗料去皮开形中"),
    FINE_CARVING(4, "精细雕琢打磨中"),
    POLISHING(5, "抛光提亮中"),
    FINAL_INSPECTION(6, "成品复检交付"),
    COMPLETED(7, "已完成"),
    EXPIRED(8, "已超时失效"),
    CANCELLED(9, "已取消");

    private final Integer code;
    private final String desc;

    OrderStatusEnum(Integer code, String desc) {
        this.code = code;
        this.desc = desc;
    }

    public static String getDescByCode(Integer code) {
        if (code == null) {
            return "";
        }
        for (OrderStatusEnum e : values()) {
            if (e.getCode().equals(code)) {
                return e.getDesc();
            }
        }
        return "";
    }

}
