package com.evparts.config;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class RolePermissionConfig {

    private static final Map<String, List<String>> ROLE_PERMISSIONS = new HashMap<>();

    static {
        ROLE_PERMISSIONS.put("ADMIN", Arrays.asList("*:*"));

        ROLE_PERMISSIONS.put("PURCHASE", Arrays.asList(
                "MATERIAL:VIEW",
                "MATERIAL:CREATE",
                "MATERIAL:UPDATE",
                "MATERIAL:STOCK_IN",
                "MATERIAL:STOCK_OUT",
                "MATERIAL:STOCK_TRANSFER",
                "WORK_ORDER:VIEW",
                "WORK_ORDER:STOCK_OUT"
        ));

        ROLE_PERMISSIONS.put("PROCESS", Arrays.asList(
                "PRODUCT:VIEW",
                "PRODUCT:CREATE",
                "PRODUCT:UPDATE",
                "CATEGORY:VIEW",
                "CATEGORY:CREATE",
                "CATEGORY:UPDATE",
                "WORK_ORDER:VIEW",
                "WORK_ORDER:CREATE",
                "WORK_ORDER:CONFIRM",
                "PRODUCTION_COST:VIEW",
                "PRODUCTION_COST:CREATE",
                "PRODUCTION_COST:CONFIRM"
        ));

        ROLE_PERMISSIONS.put("PRODUCTION", Arrays.asList(
                "WORK_ORDER:VIEW",
                "WORK_ORDER:CREATE",
                "WORK_ORDER:UPDATE",
                "WORK_ORDER:START_PRODUCTION",
                "WORK_ORDER:COMPLETE_PROCESS",
                "WORK_ORDER:STOCK_OUT",
                "MATERIAL:VIEW",
                "PRODUCTION_COST:VIEW"
        ));

        ROLE_PERMISSIONS.put("QUALITY", Arrays.asList(
                "WORK_ORDER:VIEW",
                "WORK_ORDER:QUALITY_CHECK",
                "PRODUCTION_COST:VIEW"
        ));
    }

    public static boolean hasPermission(String role, String module, String operation) {
        if ("ADMIN".equals(role)) {
            return true;
        }

        List<String> permissions = ROLE_PERMISSIONS.get(role);
        if (permissions == null) {
            return false;
        }

        String requiredPermission = module + ":" + operation;
        return permissions.contains(requiredPermission) || permissions.contains(module + ":*") || permissions.contains("*:" + operation);
    }

    public static boolean hasAnyPermission(String role, String[] permissions) {
        if ("ADMIN".equals(role)) {
            return true;
        }

        List<String> rolePermissions = ROLE_PERMISSIONS.get(role);
        if (rolePermissions == null) {
            return false;
        }

        for (String permission : permissions) {
            if (rolePermissions.contains(permission)) {
                return true;
            }
        }
        return false;
    }

}
