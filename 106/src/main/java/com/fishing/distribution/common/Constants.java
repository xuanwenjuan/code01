package com.fishing.distribution.common;

public class Constants {

    public static final String REDIS_CATEGORY_TREE_KEY = "fish:category:tree";
    public static final String REDIS_CATEGORY_HOT_KEY = "fish:category:hot";
    public static final long REDIS_EXPIRE_TIME = 24 * 60 * 60;

    public static final String ROLE_ADMIN = "ADMIN";
    public static final String ROLE_DISPATCHER = "DISPATCHER";
    public static final String ROLE_SORTER = "SORTER";
    public static final String ROLE_WAREHOUSE = "WAREHOUSE";
    public static final String ROLE_FINANCE = "FINANCE";

    public static final int ORDER_STATUS_PENDING_UNLOAD = 1;
    public static final int ORDER_STATUS_UNLOADING = 2;
    public static final int ORDER_STATUS_SORTING = 3;
    public static final int ORDER_STATUS_PACKING = 4;
    public static final int ORDER_STATUS_COMPLETED = 5;
    public static final int ORDER_STATUS_CANCELLED = 6;

    public static final String BOAT_STATUS_SAILING = "正常出海";
    public static final String BOAT_STATUS_DOCKED = "休整停靠";
    public static final String BOAT_STATUS_REPAIR = "检修停运";

    public static final String LOSS_TYPE_DAMAGE = "物理损坏";
    public static final String LOSS_TYPE_DECAY = "腐败变质";
    public static final String LOSS_TYPE_MISSING = "丢失短缺";
    public static final String LOSS_TYPE_OTHER = "其他损耗";

    public static final int LOG_STATUS_SUCCESS = 1;
    public static final int LOG_STATUS_FAIL = 0;
}
