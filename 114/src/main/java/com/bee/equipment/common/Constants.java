package com.bee.equipment.common;

public class Constants {

    public static final Integer CATEGORY_STATUS_ON = 1;
    public static final Integer CATEGORY_STATUS_OFF = 0;

    public static final String MATERIAL_STATUS_NORMAL = "NORMAL";
    public static final String MATERIAL_STATUS_WARN = "WARN";
    public static final String MATERIAL_STATUS_STOP = "STOP";

    public static final String WORK_ORDER_STATUS_PENDING = "PENDING";
    public static final String WORK_ORDER_STATUS_PICKED = "PICKED";
    public static final String WORK_ORDER_STATUS_ASSEMBLING = "ASSEMBLING";
    public static final String WORK_ORDER_STATUS_FINISHED = "FINISHED";
    public static final String WORK_ORDER_STATUS_INSPECTING = "INSPECTING";
    public static final String WORK_ORDER_STATUS_DELIVERED = "DELIVERED";
    public static final String WORK_ORDER_STATUS_SUSPENDED = "SUSPENDED";

    public static final String REDIS_KEY_HOT_CATEGORY = "hot:category:";
    public static final Long REDIS_EXPIRE_HOUR = 24L;

    public static final Integer WORK_ORDER_TIMEOUT_HOURS = 24;
}
