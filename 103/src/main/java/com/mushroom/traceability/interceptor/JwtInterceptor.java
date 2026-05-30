package com.mushroom.traceability.interceptor;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mushroom.traceability.annotation.RequiresRole;
import com.mushroom.traceability.common.Result;
import com.mushroom.traceability.util.JwtUtil;
import com.mushroom.traceability.util.UserContext;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Arrays;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtInterceptor implements HandlerInterceptor {

    private final JwtUtil jwtUtil;
    private final ObjectMapper objectMapper;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if (!(handler instanceof HandlerMethod)) {
            return true;
        }

        HandlerMethod handlerMethod = (HandlerMethod) handler;
        RequiresRole methodRequiresRole = handlerMethod.getMethodAnnotation(RequiresRole.class);
        RequiresRole classRequiresRole = handlerMethod.getBeanType().getAnnotation(RequiresRole.class);

        RequiresRole requiresRole = methodRequiresRole != null ? methodRequiresRole : classRequiresRole;

        String token = request.getHeader("Authorization");

        if (token == null || !token.startsWith("Bearer ")) {
            writeErrorResponse(response, 401, "未登录或token无效");
            return false;
        }

        token = token.substring(7);

        if (!jwtUtil.validateToken(token)) {
            writeErrorResponse(response, 401, "token已过期或无效");
            return false;
        }

        Long userId = jwtUtil.getUserIdFromToken(token);
        String username = jwtUtil.getUsernameFromToken(token);
        String role = jwtUtil.getRoleFromToken(token);

        UserContext.setUserId(userId);
        UserContext.setUsername(username);
        UserContext.setRole(role);

        if (requiresRole != null) {
            String[] requiredRoles = requiresRole.value();
            boolean hasPermission = checkPermission(role, requiredRoles, requiresRole.requireAll());
            if (!hasPermission) {
                log.warn("用户 {} 角色 {} 无权限访问，需要角色: {}", username, role, Arrays.toString(requiredRoles));
                writeErrorResponse(response, 403, "无权限访问该接口");
                return false;
            }
        }

        return true;
    }

    private boolean checkPermission(String userRole, String[] requiredRoles, boolean requireAll) {
        if (userRole == null) {
            return false;
        }
        if (requireAll) {
            for (String role : requiredRoles) {
                if (!userRole.equals(role)) {
                    return false;
                }
            }
            return true;
        } else {
            for (String role : requiredRoles) {
                if (userRole.equals(role)) {
                    return true;
                }
            }
            return false;
        }
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        UserContext.clear();
    }

    private void writeErrorResponse(HttpServletResponse response, int code, String message) throws Exception {
        response.setContentType("application/json;charset=UTF-8");
        response.setStatus(code == 403 ? HttpServletResponse.SC_FORBIDDEN : HttpServletResponse.SC_UNAUTHORIZED);
        Result<Void> result = Result.error(code, message);
        response.getWriter().write(objectMapper.writeValueAsString(result));
    }
}