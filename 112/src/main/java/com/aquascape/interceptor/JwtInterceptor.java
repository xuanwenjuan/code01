package com.aquascape.interceptor;

import com.aquascape.annotation.RequiresRole;
import com.aquascape.exception.BusinessException;
import com.aquascape.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class JwtInterceptor implements HandlerInterceptor {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if ("OPTIONS".equals(request.getMethod())) {
            return true;
        }

        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }

        if (token == null || token.isEmpty()) {
            throw new BusinessException(401, "请先登录");
        }

        try {
            if (!jwtUtil.validateToken(token)) {
                throw new BusinessException(401, "登录已过期，请重新登录");
            }
        } catch (Exception e) {
            throw new BusinessException(401, "无效的token");
        }

        Long userId = jwtUtil.getUserIdFromToken(token);
        String username = jwtUtil.getUsernameFromToken(token);
        Long roleId = jwtUtil.getRoleIdFromToken(token);

        request.setAttribute("userId", userId);
        request.setAttribute("username", username);
        request.setAttribute("roleId", roleId);

        if (handler instanceof HandlerMethod) {
            HandlerMethod handlerMethod = (HandlerMethod) handler;
            RequiresRole requiresRole = handlerMethod.getMethodAnnotation(RequiresRole.class);
            if (requiresRole == null) {
                requiresRole = handlerMethod.getBeanType().getAnnotation(RequiresRole.class);
            }

            if (requiresRole != null) {
                String[] requiredRoles = requiresRole.value();
                String userRoleCode = getUserRoleCode(roleId);
                boolean hasPermission = false;
                for (String role : requiredRoles) {
                    if (role.equals(userRoleCode)) {
                        hasPermission = true;
                        break;
                    }
                }
                if (!hasPermission) {
                    throw new BusinessException(403, "权限不足");
                }
            }
        }

        return true;
    }

    private String getUserRoleCode(Long roleId) {
        if (roleId == null) return null;
        switch (roleId.intValue()) {
            case 1: return "SCAPER";
            case 2: return "PURCHASER";
            case 3: return "WAREHOUSE";
            case 4: return "ADMIN";
            default: return null;
        }
    }
}
