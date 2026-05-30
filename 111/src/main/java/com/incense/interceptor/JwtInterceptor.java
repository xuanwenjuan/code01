package com.incense.interceptor;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.incense.annotation.RequiresRole;
import com.incense.common.Result;
import com.incense.context.UserContext;
import com.incense.util.JwtUtil;
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
        RequiresRole requiresRole = handlerMethod.getMethodAnnotation(RequiresRole.class);

        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }

        if (token == null || token.trim().isEmpty()) {
            if (requiresRole != null) {
                writeErrorResponse(response, Result.unauthorized("请先登录"));
                return false;
            }
            return true;
        }

        try {
            if (!jwtUtil.validateToken(token)) {
                writeErrorResponse(response, Result.unauthorized("登录已过期，请重新登录"));
                return false;
            }

            Long userId = jwtUtil.getUserIdFromToken(token);
            String username = jwtUtil.getUsernameFromToken(token);
            String role = jwtUtil.getRoleFromToken(token);

            UserContext.setUserId(userId);
            UserContext.setUsername(username);
            UserContext.setRole(role);

            if (requiresRole != null) {
                String[] allowedRoles = requiresRole.value();
                if (!Arrays.asList(allowedRoles).contains(role)) {
                    log.warn("用户 {} 权限不足，需要: {}, 实际: {}", username, Arrays.toString(allowedRoles), role);
                    writeErrorResponse(response, Result.forbidden("权限不足，无法执行此操作"));
                    return false;
                }
            }

            return true;
        } catch (Exception e) {
            log.error("Token验证失败", e);
            writeErrorResponse(response, Result.unauthorized("无效的登录凭证"));
            return false;
        }
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        UserContext.clear();
    }

    private void writeErrorResponse(HttpServletResponse response, Result<Void> result) throws Exception {
        response.setContentType("application/json;charset=UTF-8");
        response.setStatus(HttpServletResponse.SC_OK);
        response.getWriter().write(objectMapper.writeValueAsString(result));
    }
}
