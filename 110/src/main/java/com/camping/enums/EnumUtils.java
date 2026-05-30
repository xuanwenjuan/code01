package com.camping.enums;

import java.util.HashMap;
import java.util.Map;

public class EnumUtils {

    private static final Map<Integer, String> MATERIAL_TYPE_MAP = new HashMap<>();
    private static final Map<Integer, String> MATERIAL_STATUS_MAP = new HashMap<>();
    private static final Map<Integer, String> ORDER_STATUS_MAP = new HashMap<>();
    private static final Map<Integer, String> ROLE_MAP = new HashMap<>();
    private static final Map<Integer, String> LOSS_TYPE_MAP = new HashMap<>();
    private static final Map<Integer, String> STOCK_LOCK_STATUS_MAP = new HashMap<>();

    static {
        for (MaterialTypeEnum e : MaterialTypeEnum.values()) {
            MATERIAL_TYPE_MAP.put(e.getCode(), e.getDesc());
        }
        for (MaterialStatusEnum e : MaterialStatusEnum.values()) {
            MATERIAL_STATUS_MAP.put(e.getCode(), e.getDesc());
        }
        for (OrderStatusEnum e : OrderStatusEnum.values()) {
            ORDER_STATUS_MAP.put(e.getCode(), e.getDesc());
        }
        for (RoleEnum e : RoleEnum.values()) {
            ROLE_MAP.put(e.getCode(), e.getDesc());
        }
        LOSS_TYPE_MAP.put(1, "生产损耗");
        LOSS_TYPE_MAP.put(2, "运输损耗");
        LOSS_TYPE_MAP.put(3, "质量损耗");
        LOSS_TYPE_MAP.put(4, "其他损耗");
        STOCK_LOCK_STATUS_MAP.put(1, "已锁定");
        STOCK_LOCK_STATUS_MAP.put(2, "已释放");
        STOCK_LOCK_STATUS_MAP.put(3, "已核销");
    }

    public static String getMaterialTypeName(Integer code) {
        return MATERIAL_TYPE_MAP.getOrDefault(code, "未知");
    }

    public static String getMaterialStatusName(Integer code) {
        return MATERIAL_STATUS_MAP.getOrDefault(code, "未知");
    }

    public static String getOrderStatusName(Integer code) {
        return ORDER_STATUS_MAP.getOrDefault(code, "未知");
    }

    public static String getRoleName(Integer code) {
        return ROLE_MAP.getOrDefault(code, "未知");
    }

    public static String getLossTypeName(Integer code) {
        return LOSS_TYPE_MAP.getOrDefault(code, "未知");
    }

    public static String getStockLockStatusName(Integer code) {
        return STOCK_LOCK_STATUS_MAP.getOrDefault(code, "未知");
    }
}
