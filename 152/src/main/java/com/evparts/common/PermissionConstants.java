package com.evparts.common;

public class PermissionConstants {

    public static final String MODULE_MATERIAL = "MATERIAL";
    public static final String MODULE_WORK_ORDER = "WORK_ORDER";
    public static final String MODULE_PRODUCTION_COST = "PRODUCTION_COST";
    public static final String MODULE_PRODUCT = "PRODUCT";
    public static final String MODULE_CATEGORY = "CATEGORY";
    public static final String MODULE_SYSTEM = "SYSTEM";

    public static final String OPERATION_VIEW = "VIEW";
    public static final String OPERATION_CREATE = "CREATE";
    public static final String OPERATION_UPDATE = "UPDATE";
    public static final String OPERATION_DELETE = "DELETE";
    public static final String OPERATION_CONFIRM = "CONFIRM";
    public static final String OPERATION_AUDIT = "AUDIT";
    public static final String OPERATION_RECONCILE = "RECONCILE";
    public static final String OPERATION_QUALITY_CHECK = "QUALITY_CHECK";
    public static final String OPERATION_STOCK_IN = "STOCK_IN";
    public static final String OPERATION_STOCK_OUT = "STOCK_OUT";
    public static final String OPERATION_STOCK_TRANSFER = "STOCK_TRANSFER";
    public static final String OPERATION_START_PRODUCTION = "START_PRODUCTION";
    public static final String OPERATION_COMPLETE_PROCESS = "COMPLETE_PROCESS";

    public static String buildPermission(String module, String operation) {
        return module + ":" + operation;
    }

}
