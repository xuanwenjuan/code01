package com.sheetmetal.compressor.interceptor;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sheetmetal.compressor.annotation.RequiresRole;
import com.sheetmetal.compressor.common.Result;
import com.sheetmetal.compressor.context.UserContext;
import com.sheetmetal.compressor.enums.UserRole;
import com.sheetmetal.compressor.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.io.IOException;
import java.util.Arrays;

@Component
public class JwtInterceptor implements HandlerInterceptor {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private ObjectMapper objectMapper;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if (!(handler instanceof HandlerMethod handlerMethod)) {
            return true;
        }

        String token = request.getHeader("Authorization");
        if (token == null || !token.startsWith("Bearer ")) {
            writeErrorResponse(response, Result.unauthorized());
            return false;
        }

        token = token.substring(7);
        if (!jwtUtil.validateToken(token)) {
            writeErrorResponse(response, Result.unauthorized());
            return false;
        }

        Long userId = jwtUtil.getUserId(token);
        String username = jwtUtil.getUsername(token);
        Integer role = jwtUtil.getRole(token);

        UserContext.setUserId(userId);
        UserContext.setUsername(username);
        UserContext.setRole(role);

        RequiresRole requiresRole = handlerMethod.getMethodAnnotation(RequiresRole.class);
        if (requiresRole == null) {
            requiresRole = handlerMethod.getBeanType().getAnnotation(RequiresRole.class);
        }

        if (requiresRole != null) {
            UserRole[] allowedRoles = requiresRole.value();
            boolean hasPermission = Arrays.stream(allowedRoles)
                    .anyMatch(r -> r.getCode().equals(role));
            if (!hasPermission) {
                writeErrorResponse(response, Result.forbidden());
                return false;
            }
        }

        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        UserContext.clear();
    }

    private void writeErrorResponse(HttpServletResponse response, Result<?> result) throws IOException {
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write(objectMapper.writeValueAsString(result));
    }
}
