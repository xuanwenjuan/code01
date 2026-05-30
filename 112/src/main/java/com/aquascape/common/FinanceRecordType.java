package com.aquascape.common;

public class FinanceRecordType {
    public static final int PURCHASE = 1;
    public static final int INCOME = 2;
    public static final int LOSS = 3;

    public static String getTypeName(Integer type) {
        if (type == null) return "未知";
        switch (type) {
            case 1: return "采购支出";
            case 2: return "订单收入";
            case 3: return "损耗成本";
            default: return "未知";
        }
    }
}
