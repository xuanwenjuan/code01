package com.plastic.injection.interceptor;

import com.plastic.injection.annotation.RequireRole;
import com.plastic.injection.context.UserContext;
import com.plastic.injection.enums.RoleEnum;
import com.plastic.injection.exception.BusinessException;
import com.plastic.injection.util.JwtUtil;
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
        if (token == null || !token.startsWith("Bearer ")) {
            throw new BusinessException(401, "未登录或token无效");
        }

        token = token.substring(7);
        if (!jwtUtil.validateToken(token)) {
            throw new BusinessException(401, "token已过期或无效");
        }

        UserContext.setUserId(jwtUtil.getUserId(token));
        UserContext.setUsername(jwtUtil.getUsername(token));
        UserContext.setRole(jwtUtil.getRole(token));

        if (handler instanceof HandlerMethod handlerMethod) {
            RequireRole requireRole = handlerMethod.getMethodAnnotation(RequireRole.class);
            if (requireRole == null) {
                requireRole = handlerMethod.getBeanType().getAnnotation(RequireRole.class);
            }
            if (requireRole != null) {
                Integer userRole = UserContext.getRole();
                boolean hasPermission = Arrays.stream(requireRole.value())
                        .anyMatch(role -> role.getCode().equals(userRole));
                if (!hasPermission) {
                    throw new BusinessException(403, "权限不足");
                }
            }
        }

        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        UserContext.clear();
    }
}
