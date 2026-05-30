package com.mining.maintenance.interceptor;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.mining.maintenance.annotation.RequireRole;
import com.mining.maintenance.context.UserContext;
import com.mining.maintenance.entity.SysUser;
import com.mining.maintenance.exception.BusinessException;
import com.mining.maintenance.mapper.SysUserMapper;
import com.mining.maintenance.util.JwtUtil;
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
public class JwtAuthInterceptor implements HandlerInterceptor {

    private static final String TOKEN_HEADER = "Authorization";
    private static final String TOKEN_PREFIX = "Bearer ";
    private static final String TOKEN_BLACKLIST_PREFIX = "token:blacklist:";

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private SysUserMapper sysUserMapper;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if (!(handler instanceof HandlerMethod)) {
            return true;
        }

        HandlerMethod handlerMethod = (HandlerMethod) handler;
        RequireRole requireRole = handlerMethod.getMethodAnnotation(RequireRole.class);
        if (requireRole == null) {
            requireRole = handlerMethod.getBeanType().getAnnotation(RequireRole.class);
        }

        if (requireRole == null) {
            return true;
        }

        String token = request.getHeader(TOKEN_HEADER);
        if (token == null || !token.startsWith(TOKEN_PREFIX)) {
            throw new BusinessException(401, "未登录，请先登录");
        }

        token = token.substring(TOKEN_PREFIX.length());

        if (Boolean.TRUE.equals(redisTemplate.hasKey(TOKEN_BLACKLIST_PREFIX + token))) {
            throw new BusinessException(401, "Token已失效，请重新登录");
        }

        if (!jwtUtil.validateToken(token)) {
            throw new BusinessException(401, "Token无效或已过期");
        }

        Long userId = jwtUtil.getUserIdFromToken(token);
        String username = jwtUtil.getUsernameFromToken(token);
        String role = jwtUtil.getRoleFromToken(token);

        LambdaQueryWrapper<SysUser> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SysUser::getId, userId);
        SysUser user = sysUserMapper.selectOne(wrapper);

        if (user == null) {
            throw new BusinessException(401, "用户不存在");
        }

        if (user.getStatus() == 0) {
            throw new BusinessException(401, "用户已被禁用");
        }

        String[] requiredRoles = requireRole.value();
        boolean hasPermission = Arrays.asList(requiredRoles).contains(role);
        if (!hasPermission) {
            throw new BusinessException(403, "权限不足，无法访问该资源");
        }

        UserContext.setUser(new UserContext.CurrentUser(userId, username, role, user.getMiningArea()));

        redisTemplate.expire(TOKEN_BLACKLIST_PREFIX + token, 24, TimeUnit.HOURS);

        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        UserContext.clear();
    }
}