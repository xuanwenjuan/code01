package com.evparts.interceptor;

import com.evparts.annotation.RequirePermission;
import com.evparts.annotation.RequireRole;
import com.evparts.config.RolePermissionConfig;
import com.evparts.entity.SysUser;
import com.evparts.exception.BusinessException;
import com.evparts.mapper.SysUserMapper;
import com.evparts.utils.JwtUtils;
import com.evparts.utils.UserContext;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Arrays;
import java.util.concurrent.TimeUnit;

@Component
public class AuthInterceptor implements HandlerInterceptor {

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private SysUserMapper sysUserMapper;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if (!(handler instanceof HandlerMethod)) {
            return true;
        }

        String token = request.getHeader("Authorization");
        if (token == null || token.isEmpty()) {
            throw new BusinessException(401, "未登录或登录已过期");
        }

        Claims claims = jwtUtils.parseToken(token);
        if (claims == null) {
            throw new BusinessException(401, "登录已过期，请重新登录");
        }

        Long userId = Long.valueOf(claims.get("userId").toString());
        String username = claims.get("username").toString();
        String role = claims.get("role").toString();

        String redisKey = "user:token:" + userId;
        Object redisToken = redisTemplate.opsForValue().get(redisKey);
        if (redisToken == null) {
            throw new BusinessException(401, "登录已过期，请重新登录");
        }

        SysUser user = sysUserMapper.selectById(userId);
        if (user == null || user.getStatus() == 0) {
            throw new BusinessException(401, "用户不存在或已被禁用");
        }

        HandlerMethod handlerMethod = (HandlerMethod) handler;

        RequireRole requireRole = handlerMethod.getMethodAnnotation(RequireRole.class);
        if (requireRole == null) {
            requireRole = handlerMethod.getBeanType().getAnnotation(RequireRole.class);
        }

        if (requireRole != null) {
            String[] roles = requireRole.value();
            if (!"ADMIN".equals(role) && !Arrays.asList(roles).contains(role)) {
                throw new BusinessException(403, "没有权限执行此操作");
            }
        }

        RequirePermission requirePermission = handlerMethod.getMethodAnnotation(RequirePermission.class);
        if (requirePermission == null) {
            requirePermission = handlerMethod.getBeanType().getAnnotation(RequirePermission.class);
        }

        if (requirePermission != null) {
            boolean hasPermission = false;

            if (requirePermission.value().length > 0) {
                hasPermission = RolePermissionConfig.hasAnyPermission(role, requirePermission.value());
            } else if (!requirePermission.module().isEmpty() && !requirePermission.operation().isEmpty()) {
                hasPermission = RolePermissionConfig.hasPermission(role, requirePermission.module(), requirePermission.operation());
            }

            if (!hasPermission && !"ADMIN".equals(role)) {
                throw new BusinessException(403, "没有权限执行此操作");
            }
        }

        UserContext.setUser(new UserContext.UserInfo(userId, username, role, user.getRealName()));
        redisTemplate.expire(redisKey, 24, TimeUnit.HOURS);

        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        UserContext.clear();
    }

}
