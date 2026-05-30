package com.motor.core.interceptor;

import com.motor.core.annotation.RequiresRole;
import com.motor.core.mapper.SysUserMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class RoleInterceptor implements HandlerInterceptor {
    private final SysUserMapper sysUserMapper;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if (handler instanceof HandlerMethod handlerMethod) {
            RequiresRole requiresRole = handlerMethod.getMethodAnnotation(RequiresRole.class);
            if (requiresRole == null) {
                requiresRole = handlerMethod.getBeanType().getAnnotation(RequiresRole.class);
            }

            if (requiresRole != null) {
                Long userId = (Long) request.getAttribute("userId");
                if (userId == null) {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json;charset=UTF-8");
                    response.getWriter().write("{\"code\":401,\"message\":\"未授权，请先登录\",\"data\":null}");
                    return false;
                }

                List<String> userRoles = sysUserMapper.getUserRoles(userId);
                List<String> requiredRoles = Arrays.asList(requiresRole.value());

                boolean hasPermission = userRoles.stream().anyMatch(requiredRoles::contains);
                if (!hasPermission) {
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.setContentType("application/json;charset=UTF-8");
                    response.getWriter().write("{\"code\":403,\"message\":\"权限不足\",\"data\":null}");
                    return false;
                }
            }
        }
        return true;
    }
}
