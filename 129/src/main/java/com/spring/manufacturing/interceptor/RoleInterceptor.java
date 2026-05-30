package com.spring.manufacturing.interceptor;

import com.spring.manufacturing.annotation.RequiresRole;
import com.spring.manufacturing.exception.BusinessException;
import com.spring.manufacturing.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Arrays;

@Component
@RequiredArgsConstructor
public class RoleInterceptor implements HandlerInterceptor {

    private final JwtUtil jwtUtil;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if (!(handler instanceof HandlerMethod handlerMethod)) {
            return true;
        }

        RequiresRole methodAnnotation = handlerMethod.getMethodAnnotation(RequiresRole.class);
        RequiresRole classAnnotation = handlerMethod.getBeanType().getAnnotation(RequiresRole.class);

        if (methodAnnotation == null && classAnnotation == null) {
            return true;
        }

        String token = request.getHeader("Authorization");
        if (token == null || !token.startsWith("Bearer ")) {
            throw new BusinessException(401, "未登录，请先登录");
        }

        token = token.substring(7);
        if (!jwtUtil.validateToken(token)) {
            throw new BusinessException(401, "token已过期或无效");
        }

        String userRole = jwtUtil.getRoleFromToken(token);
        String[] requiredRoles = methodAnnotation != null ? methodAnnotation.value() : classAnnotation.value();

        boolean hasPermission = Arrays.asList(requiredRoles).contains(userRole);
        if (!hasPermission) {
            throw new BusinessException(403, "权限不足，无法访问该资源");
        }

        Long userId = jwtUtil.getUserIdFromToken(token);
        request.setAttribute("userId", userId);
        request.setAttribute("role", userRole);

        return true;
    }
}