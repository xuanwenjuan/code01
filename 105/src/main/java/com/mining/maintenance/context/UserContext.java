package com.mining.maintenance.context;

public class UserContext {

    private static final ThreadLocal<CurrentUser> USER_HOLDER = new ThreadLocal<>();

    public static void setUser(CurrentUser user) {
        USER_HOLDER.set(user);
    }

    public static CurrentUser getUser() {
        return USER_HOLDER.get();
    }

    public static Long getUserId() {
        CurrentUser user = getUser();
        return user != null ? user.getUserId() : null;
    }

    public static String getUsername() {
        CurrentUser user = getUser();
        return user != null ? user.getUsername() : null;
    }

    public static String getRole() {
        CurrentUser user = getUser();
        return user != null ? user.getRole() : null;
    }

    public static void clear() {
        USER_HOLDER.remove();
    }

    public static class CurrentUser {
        private Long userId;
        private String username;
        private String role;
        private String miningArea;

        public CurrentUser(Long userId, String username, String role, String miningArea) {
            this.userId = userId;
            this.username = username;
            this.role = role;
            this.miningArea = miningArea;
        }

        public Long getUserId() {
            return userId;
        }

        public void setUserId(Long userId) {
            this.userId = userId;
        }

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getRole() {
            return role;
        }

        public void setRole(String role) {
            this.role = role;
        }

        public String getMiningArea() {
            return miningArea;
        }

        public void setMiningArea(String miningArea) {
            this.miningArea = miningArea;
        }
    }
}