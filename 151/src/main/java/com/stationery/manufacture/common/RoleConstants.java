package com.stationery.manufacture.common;

public class RoleConstants {

    public static final String ROLE_ADMIN = "ADMIN";
    public static final String ROLE_PURCHASER = "PURCHASER";
    public static final String ROLE_DESIGNER = "DESIGNER";
    public static final String ROLE_PRODUCTION_LEADER = "PRODUCTION_LEADER";
    public static final String ROLE_INSPECTOR = "INSPECTOR";

    public static final String[] ALL_ROLES = {
            ROLE_ADMIN, ROLE_PURCHASER, ROLE_DESIGNER,
            ROLE_PRODUCTION_LEADER, ROLE_INSPECTOR
    };

    public static final String[] PURCHASE_AND_ADMIN = {ROLE_ADMIN, ROLE_PURCHASER};
    public static final String[] DESIGN_AND_ADMIN = {ROLE_ADMIN, ROLE_DESIGNER};
    public static final String[] PRODUCTION_AND_ADMIN = {ROLE_ADMIN, ROLE_PRODUCTION_LEADER};
    public static final String[] INSPECT_AND_ADMIN = {ROLE_ADMIN, ROLE_INSPECTOR};
    public static final String[] PRODUCTION_INSPECT_ADMIN = {ROLE_ADMIN, ROLE_PRODUCTION_LEADER, ROLE_INSPECTOR};
    public static final String[] DESIGN_PRODUCTION_ADMIN = {ROLE_ADMIN, ROLE_DESIGNER, ROLE_PRODUCTION_LEADER};
    public static final String[] BUSINESS_ROLES = {ROLE_PURCHASER, ROLE_DESIGNER, ROLE_PRODUCTION_LEADER, ROLE_INSPECTOR};

    private RoleConstants() {
    }
}
