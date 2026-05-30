package com.firecontrol.interceptor;

import com.firecontrol.common.ResultCode;
import com.firecontrol.exception.BusinessException;
import com.firecontrol.utils.JwtUtil;
import com.firecontrol.utils.UserContextUtil;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class JwtAuthenticationInterceptor implements HandlerInterceptor {

    @Resource
    private JwtUtil jwtUtil;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if ("OPTIONS".equals(request.getMethod())) {
            return true;
        }

        String header = request.getHeader(jwtUtil.getHeader());
        if (header == null || !header.startsWith(jwtUtil.getPrefix() + " ")) {
            throw new BusinessException(ResultCode.UNAUTHORIZED);
        }

        String token = header.substring(jwtUtil.getPrefix().length() + 1);

        if (!jwtUtil.validateToken(token)) {
            throw new BusinessException(ResultCode.TOKEN_INVALID);
        }

        if (jwtUtil.isTokenExpired(token)) {
            throw new BusinessException(ResultCode.TOKEN_EXPIRED);
        }

        Long userId = jwtUtil.getUserIdFromToken(token);
        String username = jwtUtil.getUsernameFromToken(token);
        String roleCode = jwtUtil.getRoleCodeFromToken(token);

        UserContextUtil.setUserId(userId);
        UserContextUtil.setUsername(username);
        UserContextUtil.setRoleCode(roleCode);

        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        UserContextUtil.clear();
    }
}
