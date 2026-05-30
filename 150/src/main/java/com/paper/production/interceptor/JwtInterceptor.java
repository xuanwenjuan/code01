package com.paper.production.interceptor;

import com.paper.production.common.ResultCode;
import com.paper.production.exception.BusinessException;
import com.paper.production.utils.JwtUtil;
import com.paper.production.utils.UserContextUtil;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class JwtInterceptor implements HandlerInterceptor {

    @Resource
    private JwtUtil jwtUtil;

    @Value("${jwt.header}")
    private String header;

    @Value("${jwt.prefix}")
    private String prefix;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String token = request.getHeader(header);
        if (token == null || !token.startsWith(prefix)) {
            throw new BusinessException(ResultCode.UNAUTHORIZED);
        }

        token = token.substring(prefix.length()).trim();

        if (jwtUtil.isTokenExpired(token)) {
            throw new BusinessException(ResultCode.TOKEN_EXPIRED);
        }

        Long userId = jwtUtil.getUserIdFromToken(token);
        String username = jwtUtil.getUsernameFromToken(token);
        String role = jwtUtil.getRoleFromToken(token);

        if (userId == null || username == null || role == null) {
            throw new BusinessException(ResultCode.TOKEN_INVALID);
        }

        UserContextUtil.setUserId(userId);
        UserContextUtil.setUsername(username);
        UserContextUtil.setRole(role);

        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        UserContextUtil.clear();
    }
}
