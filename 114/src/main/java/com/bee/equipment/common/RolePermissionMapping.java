package com.bee.equipment.common;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class RolePermissionMapping {

    private static final Map<String, List<PermissionEnum>> ROLE_PERMISSION_MAP = new HashMap<>();

    static {
        ROLE_PERMISSION_MAP.put(RoleEnum.ADMIN.getCode(), Arrays.asList(
                PermissionEnum.CATEGORY_VIEW,
                PermissionEnum.CATEGORY_ADD,
                PermissionEnum.CATEGORY_EDIT,
                PermissionEnum.CATEGORY_DELETE,
                PermissionEnum.CATEGORY_STATUS,
                PermissionEnum.MATERIAL_VIEW,
                PermissionEnum.MATERIAL_ADD,
                PermissionEnum.MATERIAL_EDIT,
                PermissionEnum.MATERIAL_DELETE,
                PermissionEnum.MATERIAL_STATUS,
                PermissionEnum.WORKORDER_VIEW,
                PermissionEnum.WORKORDER_CREATE,
                PermissionEnum.WORKORDER_PICK,
                PermissionEnum.WORKORDER_ASSEMBLE,
                PermissionEnum.WORKORDER_INSPECT,
                PermissionEnum.WORKORDER_DELIVER,
                PermissionEnum.WORKORDER_CANCEL,
                PermissionEnum.COST_STATISTICS_VIEW,
                PermissionEnum.COST_STATISTICS_GENERATE,
                PermissionEnum.USER_MANAGE
        ));

        ROLE_PERMISSION_MAP.put(RoleEnum.ASSEMBLER.getCode(), Arrays.asList(
                PermissionEnum.CATEGORY_VIEW,
                PermissionEnum.MATERIAL_VIEW,
                PermissionEnum.WORKORDER_VIEW,
                PermissionEnum.WORKORDER_PICK,
                PermissionEnum.WORKORDER_ASSEMBLE
        ));

        ROLE_PERMISSION_MAP.put(RoleEnum.PURCHASER.getCode(), Arrays.asList(
                PermissionEnum.CATEGORY_VIEW,
                PermissionEnum.MATERIAL_VIEW,
                PermissionEnum.MATERIAL_ADD,
                PermissionEnum.MATERIAL_EDIT,
                PermissionEnum.MATERIAL_STATUS,
                PermissionEnum.WORKORDER_VIEW
        ));

        ROLE_PERMISSION_MAP.put(RoleEnum.OPERATOR.getCode(), Arrays.asList(
                PermissionEnum.CATEGORY_VIEW,
                PermissionEnum.MATERIAL_VIEW,
                PermissionEnum.WORKORDER_VIEW,
                PermissionEnum.WORKORDER_DELIVER
        ));
    }

    public static boolean hasPermission(String role, PermissionEnum permission) {
        List<PermissionEnum> permissions = ROLE_PERMISSION_MAP.get(role);
        return permissions != null && permissions.contains(permission);
    }

    public static List<PermissionEnum> getPermissionsByRole(String role) {
        return ROLE_PERMISSION_MAP.get(role);
    }
}
