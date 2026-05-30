package com.oiledumbrella.enums;

import lombok.Getter;

@Getter
public enum OrderStatusEnum {
    PENDING_DEPOSIT("PENDING_DEPOSIT", "待付定金"),
    DESIGN_CONFIRMED("DESIGN_CONFIRMED", "设计已确认"),
    IN_PRODUCTION("IN_PRODUCTION", "生产中"),
    COMPLETED("COMPLETED", "已完成"),
    CANCELLED("CANCELLED", "已取消");

    private final String code;
    private final String desc;

    OrderStatusEnum(String code, String desc) {
        this.code = code;
        this.desc = desc;
    }

    public static OrderStatusEnum getNextStatus(OrderStatusEnum current) {
        return switch (current) {
            case PENDING_DEPOSIT -> DESIGN_CONFIRMED;
            case DESIGN_CONFIRMED -> IN_PRODUCTION;
            case IN_PRODUCTION -> COMPLETED;
            default -> null;
        };
    }

    public static boolean canTransition(OrderStatusEnum from, OrderStatusEnum to) {
        OrderStatusEnum next = getNextStatus(from);
        return next != null && next == to;
    }
}
