package com.fan.impeller.interceptor;

import com.fan.impeller.common.Constants;
import com.fan.impeller.context.UserContext;
import com.fan.impeller.exception.BusinessException;
import com.fan.impeller.util.JwtUtil;
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
        String authHeader = request.getHeader(Constants.TOKEN_HEADER);
        if (authHeader == null || !authHeader.startsWith(Constants.TOKEN_PREFIX)) {
            throw new BusinessException(401, "请先登录");
        }

        String token = authHeader.substring(Constants.TOKEN_PREFIX.length());
        if (!jwtUtil.validateToken(token)) {
            throw new BusinessException(401, "token无效或已过期");
        }

        UserContext.setUserId(jwtUtil.getUserId(token));
        UserContext.setUsername(jwtUtil.getUsername(token));
        UserContext.setRole(jwtUtil.getRole(token));

        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        UserContext.clear();
    }
}