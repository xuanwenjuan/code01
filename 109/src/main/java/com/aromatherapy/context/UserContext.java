package com.aromatherapy.context;

public class UserContext {

    private static final ThreadLocal<Long> userIdThreadLocal = new ThreadLocal<>();
    private static final ThreadLocal<String> usernameThreadLocal = new ThreadLocal<>();
    private static final ThreadLocal<String> roleThreadLocal = new ThreadLocal<>();

    public static void setUserId(Long userId) {
        userIdThreadLocal.set(userId);
    }

    public static Long getUserId() {
        return userIdThreadLocal.get();
    }

    public static void setUsername(String username) {
        usernameThreadLocal.set(username);
    }

    public static String getUsername() {
        return usernameThreadLocal.get();
    }

    public static void setRole(String role) {
        roleThreadLocal.set(role);
    }

    public static String getRole() {
        return roleThreadLocal.get();
    }

    public static void clear() {
        userIdThreadLocal.remove();
        usernameThreadLocal.remove();
        roleThreadLocal.remove();
    }
}
