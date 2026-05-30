package com.aluminum.extrusion.util;

import com.aluminum.extrusion.enums.RoleEnum;

public class UserContext {
    private static final ThreadLocal<Long> userIdHolder = new ThreadLocal<>();
    private static final ThreadLocal<String> usernameHolder = new ThreadLocal<>();
    private static final ThreadLocal<Integer> roleHolder = new ThreadLocal<>();

    public static void setUserId(Long userId) {
        userIdHolder.set(userId);
    }

    public static Long getUserId() {
        return userIdHolder.get();
    }

    public static void setUsername(String username) {
        usernameHolder.set(username);
    }

    public static String getUsername() {
        return usernameHolder.get();
    }

    public static void setRole(Integer role) {
        roleHolder.set(role);
    }

    public static Integer getRole() {
        return roleHolder.get();
    }

    public static boolean hasRole(RoleEnum role) {
        Integer currentRole = getRole();
        return currentRole != null && currentRole.equals(role.getCode());
    }

    public static boolean hasAnyRole(RoleEnum... roles) {
        Integer currentRole = getRole();
        if (currentRole == null) {
            return false;
        }
        for (RoleEnum role : roles) {
            if (currentRole.equals(role.getCode())) {
                return true;
            }
        }
        return false;
    }

    public static boolean isAdmin() {
        return hasRole(RoleEnum.ADMIN);
    }

    public static boolean isPurchaser() {
        return hasAnyRole(RoleEnum.ADMIN, RoleEnum.PURCHASER);
    }

    public static boolean isProcessEngineer() {
        return hasAnyRole(RoleEnum.ADMIN, RoleEnum.PROCESS_ENGINEER);
    }

    public static boolean isTeamLeader() {
        return hasAnyRole(RoleEnum.ADMIN, RoleEnum.TEAM_LEADER);
    }

    public static boolean isQualityInspector() {
        return hasAnyRole(RoleEnum.ADMIN, RoleEnum.QUALITY_INSPECTOR);
    }

    public static void clear() {
        userIdHolder.remove();
        usernameHolder.remove();
        roleHolder.remove();
    }
}
