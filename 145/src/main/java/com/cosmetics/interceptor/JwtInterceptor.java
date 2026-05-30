package com.cosmetics.interceptor;

import com.cosmetics.common.ResultCode;
import com.cosmetics.context.UserContext;
import com.cosmetics.exception.BusinessException;
import com.cosmetics.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
@RequiredArgsConstructor
public class JwtInterceptor implements HandlerInterceptor {

    private final JwtUtil jwtUtil;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String token = request.getHeader(jwtUtil.getHeader());
        if (token != null && token.startsWith(jwtUtil.getPrefix())) {
            token = token.substring(jwtUtil.getPrefix().length());
            if (jwtUtil.validateToken(token)) {
                UserContext.setUserId(jwtUtil.getUserIdFromToken(token));
                UserContext.setUsername(jwtUtil.getUsernameFromToken(token));
                UserContext.setRole(jwtUtil.getRoleFromToken(token));
                return true;
            }
            throw new BusinessException(ResultCode.TOKEN_INVALID);
        }
        throw new BusinessException(ResultCode.UNAUTHORIZED);
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        UserContext.clear();
    }
}
