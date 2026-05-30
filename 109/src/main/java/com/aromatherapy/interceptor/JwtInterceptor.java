package com.aromatherapy.interceptor;

import com.aromatherapy.annotation.RequiresPermission;
import com.aromatherapy.annotation.RequiresRole;
import com.aromatherapy.context.UserContext;
import com.aromatherapy.exception.BusinessException;
import com.aromatherapy.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;
import java.util.Arrays;
import java.util.Set;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtInterceptor implements HandlerInterceptor {

    private final JwtUtil jwtUtil;

    private static final Set<String> ROLE_HIERARCHY = Set.of("ADMIN", "OPERATOR", "PERFUMER", "WAREHOUSE", "BUYER");

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if (!(handler instanceof HandlerMethod handlerMethod)) {
            return true;
        }

        String requestPath = request.getRequestURI();
        if (requestPath.startsWith("/api/auth/")) {
            return true;
        }

        String token = request.getHeader("Authorization");
        if (token == null || !token.startsWith("Bearer ")) {
            throw new BusinessException(401, "未登录或token无效");
        }

        token = token.substring(7);
        if (!jwtUtil.validateToken(token)) {
            throw new BusinessException(401, "token已过期或无效");
        }

        Long userId = jwtUtil.getUserIdFromToken(token);
        String username = jwtUtil.getUsernameFromToken(token);
        String role = jwtUtil.getRoleFromToken(token);

        UserContext.setUserId(userId);
        UserContext.setUsername(username);
        UserContext.setRole(role);

        request.setAttribute("userId", userId);
        request.setAttribute("username", username);
        request.setAttribute("role", role);

        checkRolePermission(handlerMethod, role);
        checkFineGrainedPermission(handlerMethod, role);

        return true;
    }

    private void checkRolePermission(HandlerMethod handlerMethod, String role) {
        RequiresRole requiresRole = handlerMethod.getMethodAnnotation(RequiresRole.class);
        if (requiresRole == null) {
            requiresRole = handlerMethod.getBeanType().getAnnotation(RequiresRole.class);
        }

        if (requiresRole != null) {
            String[] allowedRoles = requiresRole.value();
            boolean hasPermission = "ADMIN".equals(role) || Arrays.asList(allowedRoles).contains(role);
            if (!hasPermission) {
                log.warn("用户角色 {} 无权限访问，需要角色: {}", role, Arrays.toString(allowedRoles));
                throw new BusinessException(403, "权限不足，需要角色: " + Arrays.toString(allowedRoles));
            }
        }
    }

    private void checkFineGrainedPermission(HandlerMethod handlerMethod, String role) {
        RequiresPermission requiresPermission = handlerMethod.getMethodAnnotation(RequiresPermission.class);
        if (requiresPermission == null) {
            return;
        }

        String permission = requiresPermission.value();
        boolean hasPermission = checkPermission(role, permission);
        if (!hasPermission) {
            log.warn("用户角色 {} 无权限访问，需要权限: {}", role, permission);
            throw new BusinessException(403, "权限不足，需要权限: " + permission);
        }
    }

    private boolean checkPermission(String role, String permission) {
        if ("ADMIN".equals(role)) {
            return true;
        }

        return switch (permission) {
            case "category:read" -> true;
            case "category:write" -> "OPERATOR".equals(role);
            case "material:read" -> true;
            case "material:write" -> "BUYER".equals(role) || "WAREHOUSE".equals(role);
            case "workorder:read" -> true;
            case "workorder:create" -> "OPERATOR".equals(role);
            case "workorder:mixing" -> "PERFUMER".equals(role);
            case "workorder:qc" -> "PERFUMER".equals(role);
            case "workorder:package" -> "WAREHOUSE".equals(role);
            case "workorder:ship" -> "OPERATOR".equals(role);
            case "ledger:read" -> "OPERATOR".equals(role) || "ADMIN".equals(role);
            case "ledger:write" -> "OPERATOR".equals(role);
            default -> false;
        };
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        UserContext.clear();
    }
}
