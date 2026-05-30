package com.fitness.manufacture.common;

public class UserContextHolder {

    private static final ThreadLocal<UserContext> USER_CONTEXT_THREAD_LOCAL = new ThreadLocal<>();

    private UserContextHolder() {
    }

    public static void setUserContext(UserContext userContext) {
        USER_CONTEXT_THREAD_LOCAL.set(userContext);
    }

    public static UserContext getUserContext() {
        return USER_CONTEXT_THREAD_LOCAL.get();
    }

    public static Long getUserId() {
        UserContext userContext = USER_CONTEXT_THREAD_LOCAL.get();
        return userContext != null ? userContext.getUserId() : null;
    }

    public static String getUsername() {
        UserContext userContext = USER_CONTEXT_THREAD_LOCAL.get();
        return userContext != null ? userContext.getUsername() : null;
    }

    public static String getPostCode() {
        UserContext userContext = USER_CONTEXT_THREAD_LOCAL.get();
        return userContext != null ? userContext.getPostCode() : null;
    }

    public static void clear() {
        USER_CONTEXT_THREAD_LOCAL.remove();
    }
}
