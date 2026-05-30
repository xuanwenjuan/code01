package com.snack.processing.common;

public class PermissionConstants {

    public static final String ROLE_ADMIN = "hasRole('ADMIN')";
    public static final String ROLE_PURCHASER = "hasRole('PURCHASER')";
    public static final String ROLE_PROCESS_ENGINEER = "hasRole('PROCESS_ENGINEER')";
    public static final String ROLE_PRODUCTION_LEADER = "hasRole('PRODUCTION_LEADER')";
    public static final String ROLE_QC_INSPECTOR = "hasRole('QC_INSPECTOR')";

    public static final String PERM_MATERIAL_VIEW = ROLE_PURCHASER + " or " + ROLE_PRODUCTION_LEADER + " or " + ROLE_ADMIN;
    public static final String PERM_MATERIAL_EDIT = ROLE_PURCHASER + " or " + ROLE_ADMIN;
    public static final String PERM_MATERIAL_STOCK_IN = ROLE_PURCHASER + " or " + ROLE_ADMIN;
    public static final String PERM_MATERIAL_STOCK_OUT = ROLE_PRODUCTION_LEADER + " or " + ROLE_ADMIN;

    public static final String PERM_WORKORDER_VIEW = ROLE_PROCESS_ENGINEER + " or " + ROLE_PRODUCTION_LEADER + " or " + ROLE_QC_INSPECTOR + " or " + ROLE_ADMIN;
    public static final String PERM_WORKORDER_CREATE = ROLE_PRODUCTION_LEADER + " or " + ROLE_ADMIN;
    public static final String PERM_WORKORDER_PROCESS = ROLE_PROCESS_ENGINEER + " or " + ROLE_PRODUCTION_LEADER + " or " + ROLE_ADMIN;
    public static final String PERM_WORKORDER_QC = ROLE_QC_INSPECTOR + " or " + ROLE_ADMIN;

    public static final String PERM_STATISTICS_VIEW = ROLE_PRODUCTION_LEADER + " or " + ROLE_ADMIN;

    public static final String PERM_SUPPLIER_VIEW = ROLE_PURCHASER + " or " + ROLE_ADMIN;
    public static final String PERM_SUPPLIER_EDIT = ROLE_PURCHASER + " or " + ROLE_ADMIN;

    public static final String PERM_EQUIPMENT_VIEW = ROLE_PROCESS_ENGINEER + " or " + ROLE_PRODUCTION_LEADER + " or " + ROLE_ADMIN;
    public static final String PERM_EQUIPMENT_EDIT = ROLE_PROCESS_ENGINEER + " or " + ROLE_ADMIN;

    public static final String PERM_QUALITY_VIEW = ROLE_QC_INSPECTOR + " or " + ROLE_PRODUCTION_LEADER + " or " + ROLE_ADMIN;
    public static final String PERM_QUALITY_EDIT = ROLE_QC_INSPECTOR + " or " + ROLE_ADMIN;

    public static final String PERM_FINISHED_GOODS_VIEW = ROLE_PRODUCTION_LEADER + " or " + ROLE_ADMIN;
    public static final String PERM_FINISHED_GOODS_EDIT = ROLE_PRODUCTION_LEADER + " or " + ROLE_ADMIN;

    public static final String PERM_STOCK_CHECK_VIEW = ROLE_PURCHASER + " or " + ROLE_PRODUCTION_LEADER + " or " + ROLE_ADMIN;
    public static final String PERM_STOCK_CHECK_EDIT = ROLE_PURCHASER + " or " + ROLE_ADMIN;

    public static final String PERM_USER_MANAGE = ROLE_ADMIN;
}
