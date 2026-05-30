package com.fan.impeller.common;

public class Constants {
    public static final String TOKEN_HEADER = "Authorization";
    public static final String TOKEN_PREFIX = "Bearer ";

    public static final String ROLE_PURCHASE = "purchase";
    public static final String ROLE_PROCESS = "process";
    public static final String ROLE_PRODUCTION = "production";
    public static final String ROLE_QUALITY = "quality";
    public static final String ROLE_ADMIN = "admin";

    public static final Integer MATERIAL_STOCK_SUFFICIENT = 1;
    public static final Integer MATERIAL_STOCK_WARNING = 2;
    public static final Integer MATERIAL_STOCK_STOP = 3;

    public static final Integer WORKORDER_STATUS_PENDING = 1;
    public static final Integer WORKORDER_STATUS_IN_PRODUCTION = 2;
    public static final Integer WORKORDER_STATUS_SUSPENDED = 3;
    public static final Integer WORKORDER_STATUS_COMPLETED = 4;

    public static final Integer WORKORDER_STEP_MELTING = 1;
    public static final Integer WORKORDER_STEP_DIE_CASTING = 2;
    public static final Integer WORKORDER_STEP_COOLING = 3;
    public static final Integer WORKORDER_STEP_TRIMMING = 4;
    public static final Integer WORKORDER_STEP_BALANCING = 5;
    public static final Integer WORKORDER_STEP_SURFACE_TREATMENT = 6;
    public static final Integer WORKORDER_STEP_STORAGE = 7;
}