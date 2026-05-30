package com.firecontrol.utils;

import com.firecontrol.common.constant.UserConstants;

public class UserContextUtil {

    private static final ThreadLocal<Long> userIdHolder = new ThreadLocal<>();
    private static final ThreadLocal<String> usernameHolder = new ThreadLocal<>();
    private static final ThreadLocal<String> roleCodeHolder = new ThreadLocal<>();

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

    public static void setRoleCode(String roleCode) {
        roleCodeHolder.set(roleCode);
    }

    public static String getRoleCode() {
        return roleCodeHolder.get();
    }

    public static boolean isAdmin() {
        return UserConstants.ROLE_ADMIN.equals(getRoleCode());
    }

    public static boolean isPurchase() {
        return UserConstants.ROLE_PURCHASE.equals(getRoleCode());
    }

    public static boolean isProcess() {
        return UserConstants.ROLE_PROCESS.equals(getRoleCode());
    }

    public static boolean isProduction() {
        return UserConstants.ROLE_PRODUCTION.equals(getRoleCode());
    }

    public static boolean isQuality() {
        return UserConstants.ROLE_QUALITY.equals(getRoleCode());
    }

    public static void clear() {
        userIdHolder.remove();
        usernameHolder.remove();
        roleCodeHolder.remove();
    }
}
