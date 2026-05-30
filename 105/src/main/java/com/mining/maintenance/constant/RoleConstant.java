package com.mining.maintenance.constant;

public class RoleConstant {

    public static final String ADMIN = "ADMIN";
    public static final String DISPATCHER = "DISPATCHER";
    public static final String TECHNICIAN = "TECHNICIAN";
    public static final String MATERIAL = "MATERIAL";

    public static final String[] ALL_ROLES = {ADMIN, DISPATCHER, TECHNICIAN, MATERIAL};
    public static final String[] ADMIN_AND_DISPATCHER = {ADMIN, DISPATCHER};
    public static final String[] ADMIN_AND_TECHNICIAN = {ADMIN, TECHNICIAN};
    public static final String[] ADMIN_AND_MATERIAL = {ADMIN, MATERIAL};
}