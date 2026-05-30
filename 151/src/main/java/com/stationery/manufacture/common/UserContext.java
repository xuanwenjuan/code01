package com.stationery.manufacture.common;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserContext {

    private Long userId;
    private String username;
    private String role;
    private String realName;

    private static final ThreadLocal<UserContext> HOLDER = new ThreadLocal<>();

    public static void set(UserContext userContext) {
        HOLDER.set(userContext);
    }

    public static UserContext get() {
        return HOLDER.get();
    }

    public static void clear() {
        HOLDER.remove();
    }

    public static Long getCurrentUserId() {
        UserContext context = HOLDER.get();
        return context != null ? context.getUserId() : null;
    }

    public static String getCurrentUsername() {
        UserContext context = HOLDER.get();
        return context != null ? context.getUsername() : null;
    }

    public static String getCurrentRole() {
        UserContext context = HOLDER.get();
        return context != null ? context.getRole() : null;
    }
}
