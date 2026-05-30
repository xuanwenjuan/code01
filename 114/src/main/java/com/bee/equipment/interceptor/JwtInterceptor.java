package com.bee.equipment.interceptor;

import com.bee.equipment.annotation.Permission;
import com.bee.equipment.annotation.RequireRole;
import com.bee.equipment.common.PermissionEnum;
import com.bee.equipment.common.ResultCodeEnum;
import com.bee.equipment.common.RoleEnum;
import com.bee.equipment.common.RolePermissionMapping;
import com.bee.equipment.exception.BusinessException;
import com.bee.equipment.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Arrays;

@Component
@RequiredArgsConstructor
public class JwtInterceptor implements HandlerInterceptor {

    private final JwtUtil jwtUtil;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if ("OPTIONS".equals(request.getMethod())) {
            return true;
        }

        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }

        if (token == null || token.isEmpty()) {
            throw new BusinessException(ResultCodeEnum.UNAUTHORIZED);
        }

        if (!jwtUtil.validateToken(token)) {
            throw new BusinessException(ResultCodeEnum.TOKEN_INVALID);
        }

        if (jwtUtil.isTokenExpired(token)) {
            throw new BusinessException(ResultCodeEnum.TOKEN_EXPIRED);
        }

        Long userId = jwtUtil.getUserIdFromToken(token);
        String username = jwtUtil.getUsernameFromToken(token);
        String role = jwtUtil.getRoleFromToken(token);

        request.setAttribute("userId", userId);
        request.setAttribute("username", username);
        request.setAttribute("role", role);

        if (handler instanceof HandlerMethod handlerMethod) {
            RequireRole requireRole = handlerMethod.getMethodAnnotation(RequireRole.class);
            if (requireRole == null) {
                requireRole = handlerMethod.getBeanType().getAnnotation(RequireRole.class);
            }

            if (requireRole != null) {
                RoleEnum[] allowedRoles = requireRole.value();
                boolean hasRolePermission = Arrays.stream(allowedRoles)
                        .anyMatch(r -> r.getCode().equals(role));
                if (!hasRolePermission) {
                    throw new BusinessException(ResultCodeEnum.FORBIDDEN);
                }
            }

            Permission permissionAnnotation = handlerMethod.getMethodAnnotation(Permission.class);
            if (permissionAnnotation == null) {
                permissionAnnotation = handlerMethod.getBeanType().getAnnotation(Permission.class);
            }

            if (permissionAnnotation != null) {
                PermissionEnum requiredPermission = permissionAnnotation.value();
                if (!RolePermissionMapping.hasPermission(role, requiredPermission)) {
                    throw new BusinessException(ResultCodeEnum.FORBIDDEN);
                }
            }
        }

        return true;
    }
}
