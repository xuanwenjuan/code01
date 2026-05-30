package com.bearing.production.enums;

import lombok.Getter;

@Getter
public enum RoleEnum {
    PURCHASER(1, "原料采购员", "ROLE_PURCHASER"),
    PROCESS_ENGINEER(2, "锻造工艺员", "ROLE_PROCESS_ENGINEER"),
    LINE_LEADER(3, "产线组长", "ROLE_LINE_LEADER"),
    QUALITY_INSPECTOR(4, "品质巡检员", "ROLE_QUALITY_INSPECTOR"),
    ADMIN(5, "管理员", "ROLE_ADMIN");

    public static final int PURCHASER_CODE = 1;
    public static final int PROCESS_ENGINEER_CODE = 2;
    public static final int LINE_LEADER_CODE = 3;
    public static final int QUALITY_INSPECTOR_CODE = 4;
    public static final int ADMIN_CODE = 5;

    private final Integer code;
    private final String name;
    private final String role;

    RoleEnum(Integer code, String name, String role) {
        this.code = code;
        this.name = name;
        this.role = role;
    }
}
