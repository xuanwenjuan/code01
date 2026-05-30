package com.tarp.util;

public class StatusUtil {

    public static String getWorkOrderStatusName(Integer status) {
        if (status == null) {
            return "未知";
        }
        return switch (status) {
            case 0 -> "待下料";
            case 1 -> "裁剪中";
            case 2 -> "浸油中";
            case 3 -> "缝制中";
            case 4 -> "组装中";
            case 5 -> "质检中";
            case 6 -> "已完成";
            case 7 -> "已暂停";
            default -> "未知";
        };
    }

    public static String getMaterialStatusName(Integer status) {
        if (status == null) {
            return "未知";
        }
        return switch (status) {
            case 0 -> "停止采购";
            case 1 -> "库存预警";
            case 2 -> "库存充足";
            default -> "未知";
        };
    }

    public static String getCategoryStatusName(Integer status) {
        if (status == null) {
            return "未知";
        }
        return status == 1 ? "上架" : "下架";
    }
}
