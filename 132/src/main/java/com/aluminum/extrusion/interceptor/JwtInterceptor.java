package com.aluminum.extrusion.interceptor;

import com.aluminum.extrusion.annotation.RequireRole;
import com.aluminum.extrusion.enums.RoleEnum;
import com.aluminum.extrusion.exception.BusinessException;
import com.aluminum.extrusion.util.JwtUtil;
import com.aluminum.extrusion.util.UserContext;
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
        if (!(handler instanceof HandlerMethod handlerMethod)) {
            return true;
        }

        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
            if (jwtUtil.validateToken(token)) {
                Long userId = jwtUtil.getUserIdFromToken(token);
                String username = jwtUtil.getUsernameFromToken(token);
                Integer role = jwtUtil.getRoleFromToken(token);

                UserContext.setUserId(userId);
                UserContext.setUsername(username);
                UserContext.setRole(role);

                RequireRole requireRole = handlerMethod.getMethodAnnotation(RequireRole.class);
                if (requireRole == null) {
                    requireRole = handlerMethod.getBeanType().getAnnotation(RequireRole.class);
                }

                if (requireRole != null) {
                    RoleEnum[] allowedRoles = requireRole.value();
                    boolean hasPermission = Arrays.stream(allowedRoles)
                            .anyMatch(r -> r.getCode().equals(role));
                    if (!hasPermission) {
                        throw new BusinessException(403, "权限不足");
                    }
                }

                return true;
            }
        }

        throw new BusinessException(401, "未登录或token已过期");
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        UserContext.clear();
    }
}
