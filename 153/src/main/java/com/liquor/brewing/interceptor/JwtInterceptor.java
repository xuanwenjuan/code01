package com.liquor.brewing.interceptor;

import com.liquor.brewing.common.Constants;
import com.liquor.brewing.common.ResultCode;
import com.liquor.brewing.exception.BusinessException;
import com.liquor.brewing.util.JwtUtil;
import com.liquor.brewing.util.RedisUtil;
import com.liquor.brewing.util.UserContext;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.concurrent.TimeUnit;

@Slf4j
@Component
public class JwtInterceptor implements HandlerInterceptor {

    @Resource
    private JwtUtil jwtUtil;

    @Resource
    private RedisUtil redisUtil;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String token = request.getHeader("Authorization");
        if (token == null || !token.startsWith("Bearer ")) {
            throw new BusinessException(ResultCode.TOKEN_EMPTY);
        }
        token = token.substring(7);

        if (!jwtUtil.validateToken(token)) {
            throw new BusinessException(ResultCode.TOKEN_INVALID);
        }

        Long userId = jwtUtil.getUserIdFromToken(token);
        String username = jwtUtil.getUsernameFromToken(token);

        String redisToken = (String) redisUtil.get(Constants.TOKEN_KEY + userId);
        if (redisToken == null || !redisToken.equals(token)) {
            throw new BusinessException(ResultCode.TOKEN_EXPIRED);
        }

        redisUtil.expire(Constants.TOKEN_KEY + userId, Constants.TOKEN_EXPIRE, TimeUnit.SECONDS);

        UserContext.setUserId(userId);
        UserContext.setUsername(username);

        String roleCode = (String) redisUtil.get(Constants.USER_KEY + userId + ":role");
        if (roleCode != null) {
            UserContext.setRoleCode(roleCode);
        }

        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        UserContext.clear();
    }
}
