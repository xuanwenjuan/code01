package com.liquor.brewing.util;

import com.liquor.brewing.common.Constants;
import com.liquor.brewing.exception.BusinessException;
import com.liquor.brewing.common.ResultCode;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;

public class UserContext {

    private static final ThreadLocal<Long> USER_ID = new ThreadLocal<>();
    private static final ThreadLocal<String> USERNAME = new ThreadLocal<>();
    private static final ThreadLocal<String> ROLE_CODE = new ThreadLocal<>();

    public static void setUserId(Long userId) {
        USER_ID.set(userId);
    }

    public static Long getUserId() {
        Long userId = USER_ID.get();
        if (userId == null) {
            throw new BusinessException(ResultCode.UNAUTHORIZED);
        }
        return userId;
    }

    public static void setUsername(String username) {
        USERNAME.set(username);
    }

    public static String getUsername() {
        return USERNAME.get();
    }

    public static void setRoleCode(String roleCode) {
        ROLE_CODE.set(roleCode);
    }

    public static String getRoleCode() {
        return ROLE_CODE.get();
    }

    public static boolean isPurchaser() {
        return Constants.RoleCode.PURCHASER.equals(getRoleCode());
    }

    public static boolean isBrewer() {
        return Constants.RoleCode.BREWER.equals(getRoleCode());
    }

    public static boolean isSupervisor() {
        return Constants.RoleCode.SUPERVISOR.equals(getRoleCode());
    }

    public static boolean isInspector() {
        return Constants.RoleCode.INSPECTOR.equals(getRoleCode());
    }

    public static void clear() {
        USER_ID.remove();
        USERNAME.remove();
        ROLE_CODE.remove();
    }

    public static String getToken() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes == null) {
            return null;
        }
        HttpServletRequest request = attributes.getRequest();
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }
}
