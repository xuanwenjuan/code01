package com.heritage.dye.interceptor;

import cn.hutool.core.util.StrUtil;
import com.heritage.dye.annotation.RequireRole;
import com.heritage.dye.common.BusinessException;
import com.heritage.dye.context.UserContext;
import com.heritage.dye.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Arrays;

@Slf4j
@Component
public class JwtInterceptor implements HandlerInterceptor {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if (!(handler instanceof HandlerMethod)) {
            return true;
        }

        HandlerMethod handlerMethod = (HandlerMethod) handler;
        RequireRole requireRole = handlerMethod.getMethodAnnotation(RequireRole.class);
        if (requireRole == null) {
            requireRole = handlerMethod.getBeanType().getAnnotation(RequireRole.class);
        }

        if (requireRole == null) {
            return true;
        }

        String token = request.getHeader("Authorization");
        if (StrUtil.isBlank(token)) {
            throw new BusinessException(401, "未登录，请先登录");
        }

        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }

        try {
            if (!jwtUtil.validateToken(token)) {
                throw new BusinessException(401, "登录已过期，请重新登录");
            }

            Long userId = jwtUtil.getUserIdFromToken(token);
            String username = jwtUtil.getUsernameFromToken(token);
            String role = jwtUtil.getRoleFromToken(token);

            UserContext.setUserId(userId);
            UserContext.setUsername(username);
            UserContext.setRole(role);

            String[] requiredRoles = requireRole.value();
            if (requiredRoles.length > 0 && !Arrays.asList(requiredRoles).contains(role)) {
                throw new BusinessException(403, "权限不足，无法访问该资源");
            }

            return true;
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("Token验证失败", e);
            throw new BusinessException(401, "Token无效");
        }
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        UserContext.clear();
    }
}
