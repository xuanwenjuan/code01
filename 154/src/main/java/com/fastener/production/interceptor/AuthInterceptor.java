package com.fastener.production.interceptor;

import com.fastener.production.common.annotation.RequiresPermission;
import com.fastener.production.common.exception.BusinessException;
import com.fastener.production.common.result.ResultCode;
import com.fastener.production.common.utils.JwtUtils;
import com.fastener.production.common.utils.UserContext;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.lang.reflect.Method;
import java.util.concurrent.TimeUnit;

@Slf4j
@Component
@RequiredArgsConstructor
public class AuthInterceptor implements HandlerInterceptor {

    private final JwtUtils jwtUtils;
    private final StringRedisTemplate redisTemplate;

    @Value("${jwt.header}")
    private String header;

    @Value("${jwt.prefix}")
    private String prefix;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if ("OPTIONS".equals(request.getMethod())) {
            return true;
        }

        if (!(handler instanceof HandlerMethod handlerMethod)) {
            return true;
        }

        String token = request.getHeader(header);
        if (token == null || token.isEmpty()) {
            throw new BusinessException(ResultCode.UNAUTHORIZED);
        }

        token = token.replace(prefix + " ", "");

        if (!jwtUtils.validateToken(token)) {
            throw new BusinessException(ResultCode.TOKEN_EXPIRED);
        }

        Long userId = jwtUtils.getUserIdFromToken(token);
        String username = jwtUtils.getUsernameFromToken(token);
        String roleCode = jwtUtils.getRoleCodeFromToken(token);

        String redisToken = redisTemplate.opsForValue().get("token:" + userId);
        if (redisToken == null || !redisToken.equals(token)) {
            throw new BusinessException(ResultCode.TOKEN_INVALID);
        }

        redisTemplate.expire("token:" + userId, 24, TimeUnit.HOURS);

        UserContext.setUserId(userId);
        UserContext.setUsername(username);
        UserContext.setRoleCode(roleCode);

        Method method = handlerMethod.getMethod();
        RequiresPermission annotation = method.getAnnotation(RequiresPermission.class);
        if (annotation != null) {
            String[] requiredPermissions = annotation.value();
            boolean hasPermission = false;
            for (String perm : requiredPermissions) {
                if (roleCode.equals("admin") || roleCode.equals(perm)) {
                    hasPermission = true;
                    break;
                }
            }
            if (!hasPermission) {
                throw new BusinessException(ResultCode.PERMISSION_DENIED);
            }
        }

        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        UserContext.clear();
    }
}
