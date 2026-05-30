package com.fitness.manufacture.interceptor;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fitness.manufacture.common.Result;
import com.fitness.manufacture.common.ResultCode;
import com.fitness.manufacture.common.UserContext;
import com.fitness.manufacture.common.UserContextHolder;
import com.fitness.manufacture.utils.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.io.PrintWriter;
import java.util.concurrent.TimeUnit;

@Slf4j
@Component
@RequiredArgsConstructor
public class AuthInterceptor implements HandlerInterceptor {

    private final JwtUtil jwtUtil;
    private final RedisTemplate<String, Object> redisTemplate;

    @Value("${jwt.tokenHeader}")
    private String tokenHeader;

    private static final String TOKEN_PREFIX = "Bearer ";

    private static final String LOGIN_USER_KEY = "login:user:";

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        request.setAttribute("startTime", System.currentTimeMillis());

        if ("OPTIONS".equals(request.getMethod())) {
            return true;
        }

        String token = request.getHeader(tokenHeader);
        if (token == null || token.isEmpty() || !token.startsWith(TOKEN_PREFIX)) {
            writeErrorResponse(response, ResultCode.UNAUTHORIZED, "请先登录");
            return false;
        }

        try {
            if (!jwtUtil.validateToken(token.substring(TOKEN_PREFIX.length()))) {
                writeErrorResponse(response, ResultCode.TOKEN_INVALID, "Token无效或已过期");
                return false;
            }

            Long userId = jwtUtil.getUserIdFromToken(token);
            String postCode = jwtUtil.getPostCodeFromToken(token);
            String username = jwtUtil.getUsernameFromToken(token);

            UserContext userContext = new UserContext();
            userContext.setUserId(userId);
            userContext.setUsername(username);
            userContext.setPostCode(postCode);
            userContext.setToken(token);
            UserContextHolder.setUserContext(userContext);

            redisTemplate.expire(LOGIN_USER_KEY + userId, 2, TimeUnit.HOURS);

        } catch (Exception e) {
            log.error("认证失败：{}", e.getMessage());
            writeErrorResponse(response, ResultCode.UNAUTHORIZED, "认证失败");
            return false;
        }

        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        UserContextHolder.clear();
    }

    private void writeErrorResponse(HttpServletResponse response, ResultCode resultCode, String message) throws Exception {
        response.setContentType("application/json;charset=UTF-8");
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        PrintWriter writer = response.getWriter();
        ObjectMapper objectMapper = new ObjectMapper();
        writer.write(objectMapper.writeValueAsString(Result.fail(resultCode, message)));
        writer.flush();
        writer.close();
    }
}
