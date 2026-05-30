package com.aquascape.common;

public class StockStatus {
    public static final int AVAILABLE = 1;
    public static final int LOW_STOCK = 2;
    public static final int OUT_OF_STOCK = 3;

    public static String getStatusName(Integer status) {
        if (status == null) return "未知";
        return switch (status) {
            case 1 -> "现货充足";
            case 2 -> "库存紧张";
            case 3 -> "已断货";
            default -> "未知";
        };
    }
}
