package com.radiator.management.interceptor;

import com.radiator.management.annotation.RequiresRole;
import com.radiator.management.exception.BusinessException;
import com.radiator.management.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class PermissionInterceptor implements HandlerInterceptor {

    private final JwtUtil jwtUtil;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if (!(handler instanceof HandlerMethod handlerMethod)) {
            return true;
        }

        RequiresRole classAnnotation = handlerMethod.getBeanType().getAnnotation(RequiresRole.class);
        RequiresRole methodAnnotation = handlerMethod.getMethodAnnotation(RequiresRole.class);

        String[] requiredRoles = null;
        if (methodAnnotation != null) {
            requiredRoles = methodAnnotation.value();
        } else if (classAnnotation != null) {
            requiredRoles = classAnnotation.value();
        }

        if (requiredRoles == null || requiredRoles.length == 0) {
            return true;
        }

        String token = request.getHeader("Authorization");
        if (token == null || !token.startsWith("Bearer ")) {
            throw new BusinessException(401, "未登录");
        }

        token = token.substring(7);
        String userRole = jwtUtil.getRoleFromToken(token);

        List<String> requiredRoleList = Arrays.asList(requiredRoles);
        if (!requiredRoleList.contains(userRole) && !"admin".equals(userRole)) {
            throw new BusinessException(403, "权限不足，需要角色：" + String.join(",", requiredRoles));
        }

        return true;
    }
}
