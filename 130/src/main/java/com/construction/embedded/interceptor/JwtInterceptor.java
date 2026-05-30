package com.construction.embedded.interceptor;

import com.construction.embedded.annotation.RequiresRole;
import com.construction.embedded.exception.BusinessException;
import com.construction.embedded.mapper.SysUserMapper;
import com.construction.embedded.util.JwtUtil;
import com.construction.embedded.util.UserContext;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Arrays;
import java.util.List;

@Slf4j
@Component
public class JwtInterceptor implements HandlerInterceptor {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private SysUserMapper sysUserMapper;

    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    private static final String TOKEN_BLACKLIST_PREFIX = "token:blacklist:";

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if (!(handler instanceof HandlerMethod)) {
            return true;
        }

        String token = request.getHeader("Authorization");

        if (token == null || !token.startsWith("Bearer ")) {
            throw new BusinessException(401, "未登录或token无效");
        }

        token = token.substring(7);

        if (Boolean.TRUE.equals(stringRedisTemplate.hasKey(TOKEN_BLACKLIST_PREFIX + token))) {
            throw new BusinessException(401, "token已失效，请重新登录");
        }

        if (!jwtUtil.validateToken(token)) {
            throw new BusinessException(401, "token已过期或无效");
        }

        Long userId = jwtUtil.getUserIdFromToken(token);
        String username = jwtUtil.getUsernameFromToken(token);

        UserContext.setUserId(userId);
        UserContext.setUsername(username);

        HandlerMethod handlerMethod = (HandlerMethod) handler;
        RequiresRole methodRequiresRole = handlerMethod.getMethodAnnotation(RequiresRole.class);
        RequiresRole classRequiresRole = handlerMethod.getBeanType().getAnnotation(RequiresRole.class);

        if (methodRequiresRole != null) {
            checkRolePermission(methodRequiresRole, userId);
        } else if (classRequiresRole != null) {
            checkRolePermission(classRequiresRole, userId);
        }

        return true;
    }

    private void checkRolePermission(RequiresRole requiresRole, Long userId) {
        List<String> userRoles = sysUserMapper.selectRoleCodesByUserId(userId);
        String[] requiredRoles = requiresRole.value();

        if (userRoles.contains("ADMIN")) {
            return;
        }

        boolean hasPermission;
        if (requiresRole.requireAll()) {
            hasPermission = userRoles.containsAll(Arrays.asList(requiredRoles));
        } else {
            hasPermission = Arrays.stream(requiredRoles).anyMatch(userRoles::contains);
        }

        if (!hasPermission) {
            throw new BusinessException(403, "权限不足，无法执行此操作");
        }
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        UserContext.clear();
    }
}
