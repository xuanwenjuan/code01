package com.hydraulic.piston.interceptor;

import com.hydraulic.piston.exception.BusinessException;
import com.hydraulic.piston.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtInterceptor implements HandlerInterceptor {

    private final JwtUtil jwtUtil;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String token = request.getHeader("Authorization");
        if (token == null || token.isEmpty()) {
            throw new BusinessException(401, "请先登录");
        }

        try {
            if (jwtUtil.isTokenExpired(token)) {
                throw new BusinessException(401, "登录已过期，请重新登录");
            }
            Long userId = jwtUtil.getUserId(token);
            String username = jwtUtil.getUsername(token);
            Integer roleId = jwtUtil.getRoleId(token);

            log.info("JWT验证 - userId: {}, username: {}, roleId: {}", userId, username, roleId);

            request.setAttribute("userId", String.valueOf(userId));
            request.setAttribute("username", username);
            request.setAttribute("roleId", String.valueOf(roleId));
        } catch (Exception e) {
            log.error("JWT验证失败", e);
            throw new BusinessException(401, "无效的token");
        }

        return true;
    }
}
