package com.mushroom.traceability.common;

public class Constants {

    public static final String ROLE_ADMIN = "ADMIN";
    public static final String ROLE_HARVESTER = "HARVESTER";
    public static final String ROLE_QUALITY = "QUALITY";
    public static final String ROLE_WAREHOUSE = "WAREHOUSE";
    public static final String ROLE_OPERATOR = "OPERATOR";

    public static final String CATEGORY_TYPE_FRESH = "FRESH";
    public static final String CATEGORY_TYPE_DRIED = "DRIED";
    public static final String CATEGORY_TYPE_MEDICINAL = "MEDICINAL";
    public static final String CATEGORY_TYPE_PREPARED = "PREPARED";

    public static final String AREA_STATUS_NORMAL = "NORMAL";
    public static final String AREA_STATUS_FORBIDDEN = "FORBIDDEN";

    public static final String TASK_STATUS_PENDING = "PENDING";
    public static final String TASK_STATUS_ASSIGNED = "ASSIGNED";
    public static final String TASK_STATUS_COLLECTING = "COLLECTING";
    public static final String TASK_STATUS_QUALITY_CHECK = "QUALITY_CHECK";
    public static final String TASK_STATUS_WAREHOUSE = "WAREHOUSE";
    public static final String TASK_STATUS_SHIPPED = "SHIPPED";
    public static final String TASK_STATUS_EXPIRED = "EXPIRED";
    public static final String TASK_STATUS_CANCELLED = "CANCELLED";

    public static final String QUALITY_LEVEL_A = "A";
    public static final String QUALITY_LEVEL_B = "B";
    public static final String QUALITY_LEVEL_C = "C";
    public static final String QUALITY_LEVEL_D = "D";

    public static final String BIZ_TYPE_CATEGORY = "CATEGORY";
    public static final String BIZ_TYPE_AREA = "AREA";
    public static final String BIZ_TYPE_TASK = "TASK";
    public static final String BIZ_TYPE_STATISTICS = "STATISTICS";

    public static final String OP_TYPE_CREATE = "CREATE";
    public static final String OP_TYPE_UPDATE = "UPDATE";
    public static final String OP_TYPE_DELETE = "DELETE";
    public static final String OP_TYPE_STATUS_CHANGE = "STATUS_CHANGE";
}