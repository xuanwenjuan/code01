package com.textile.production.context;

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

    private static final ThreadLocal<UserContext> HOLDER = new ThreadLocal<>();

    public static void set(UserContext userContext) {
        HOLDER.set(userContext);
    }

    public static UserContext get() {
        return HOLDER.get();
    }

    public static void remove() {
        HOLDER.remove();
    }

    public static Long getUserId() {
        UserContext context = HOLDER.get();
        return context != null ? context.getUserId() : null;
    }

    public static String getUsername() {
        UserContext context = HOLDER.get();
        return context != null ? context.getUsername() : null;
    }

    public static String getRole() {
        UserContext context = HOLDER.get();
        return context != null ? context.getRole() : null;
    }
}
