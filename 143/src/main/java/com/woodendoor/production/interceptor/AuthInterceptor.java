package com.woodendoor.production.interceptor;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.woodendoor.production.annotation.RequireRole;
import com.woodendoor.production.common.Result;
import com.woodendoor.production.context.UserContext;
import com.woodendoor.production.entity.SysUser;
import com.woodendoor.production.mapper.SysUserMapper;
import com.woodendoor.production.util.JwtUtil;
import com.woodendoor.production.util.RedisUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.io.IOException;
import java.util.Arrays;
import java.util.concurrent.TimeUnit;

@Component
@RequiredArgsConstructor
public class AuthInterceptor implements HandlerInterceptor {

    private final JwtUtil jwtUtil;
    private final SysUserMapper sysUserMapper;
    private final RedisUtil redisUtil;
    private final ObjectMapper objectMapper;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if ("OPTIONS".equals(request.getMethod())) {
            return true;
        }

        if (!(handler instanceof HandlerMethod)) {
            return true;
        }

        HandlerMethod handlerMethod = (HandlerMethod) handler;
        RequireRole requireRole = handlerMethod.getMethodAnnotation(RequireRole.class);
        if (requireRole == null) {
            requireRole = handlerMethod.getBeanType().getAnnotation(RequireRole.class);
        }

        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }

        if (token == null || token.isEmpty()) {
            if (requireRole != null) {
                writeErrorResponse(response, 401, "请先登录");
                return false;
            }
            return true;
        }

        try {
            if (!jwtUtil.validateToken(token)) {
                writeErrorResponse(response, 401, "登录已过期，请重新登录");
                return false;
            }

            Long userId = jwtUtil.getUserIdFromToken(token);
            String cacheKey = "user:token:" + userId;

            SysUser user = (SysUser) redisUtil.get(cacheKey);
            if (user == null) {
                user = sysUserMapper.selectOne(new LambdaQueryWrapper<SysUser>()
                        .eq(SysUser::getId, userId)
                        .eq(SysUser::getStatus, 1));
                if (user == null) {
                    writeErrorResponse(response, 401, "用户不存在或已被禁用");
                    return false;
                }
                redisUtil.set(cacheKey, user, 24, TimeUnit.HOURS);
            }

            if (user.getStatus() == 0) {
                writeErrorResponse(response, 403, "用户已被禁用");
                return false;
            }

            if (requireRole != null && requireRole.value().length > 0) {
                boolean hasRole = Arrays.asList(requireRole.value()).contains(user.getRole());
                if (!hasRole) {
                    writeErrorResponse(response, 403, "权限不足");
                    return false;
                }
            }

            UserContext.setUser(user);
            return true;
        } catch (Exception e) {
            writeErrorResponse(response, 401, "Token无效");
            return false;
        }
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        UserContext.clear();
    }

    private void writeErrorResponse(HttpServletResponse response, int code, String message) throws IOException {
        response.setStatus(200);
        response.setContentType("application/json;charset=UTF-8");
        Result<Void> result = Result.error(code, message);
        response.getWriter().write(objectMapper.writeValueAsString(result));
    }
}
