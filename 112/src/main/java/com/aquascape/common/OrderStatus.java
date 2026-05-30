package com.aquascape.common;

public class OrderStatus {
    public static final int PENDING_CONFIRM = 1;
    public static final int SCHEME_CONFIRMED = 2;
    public static final int BUILDING = 3;
    public static final int COMPLETED = 4;
    public static final int DELIVERED = 5;
    public static final int CANCELLED = 6;

    public static String getStatusName(Integer status) {
        if (status == null) return "未知";
        return switch (status) {
            case 1 -> "待确认方案";
            case 2 -> "方案已确认";
            case 3 -> "搭建中";
            case 4 -> "已完成";
            case 5 -> "已交付";
            case 6 -> "已取消";
            default -> "未知状态";
        };
    }
}
