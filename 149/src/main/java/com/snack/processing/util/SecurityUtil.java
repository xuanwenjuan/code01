package com.snack.processing.util;

import com.snack.processing.common.enums.RoleEnum;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Collection;

public class SecurityUtil {

    private SecurityUtil() {
    }

    public static Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof Long) {
            return (Long) authentication.getPrincipal();
        }
        return 1L;
    }

    public static String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null) {
            return authentication.getName();
        }
        return "system";
    }

    public static Integer getCurrentUserRole() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null) {
            Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
            for (GrantedAuthority authority : authorities) {
                String roleName = authority.getAuthority().replace("ROLE_", "");
                RoleEnum roleEnum = RoleEnum.getByRoleName(roleName);
                if (roleEnum != null) {
                    return roleEnum.getCode();
                }
            }
        }
        return null;
    }

    public static boolean hasRole(RoleEnum role) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null) {
            return authentication.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_" + role.getRoleName()));
        }
        return false;
    }

    public static boolean isAdmin() {
        return hasRole(RoleEnum.ADMIN);
    }

    public static boolean isPurchaser() {
        return hasRole(RoleEnum.PURCHASER) || isAdmin();
    }

    public static boolean isProcessEngineer() {
        return hasRole(RoleEnum.PROCESS_ENGINEER) || isAdmin();
    }

    public static boolean isProductionLeader() {
        return hasRole(RoleEnum.PRODUCTION_LEADER) || isAdmin();
    }

    public static boolean isQcInspector() {
        return hasRole(RoleEnum.QC_INSPECTOR) || isAdmin();
    }
}
