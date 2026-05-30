package com.oiledumbrella.interceptor;

import com.oiledumbrella.annotation.RequiresRole;
import com.oiledumbrella.exception.BusinessException;
import com.oiledumbrella.mapper.SysUserRoleMapper;
import com.oiledumbrella.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtInterceptor implements HandlerInterceptor {

    private final JwtUtil jwtUtil;
    private final SysUserRoleMapper userRoleMapper;
    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if (!(handler instanceof HandlerMethod)) {
            return true;
        }

        HandlerMethod handlerMethod = (HandlerMethod) handler;
        Method method = handlerMethod.getMethod();
        Class<?> clazz = method.getDeclaringClass();

        RequiresRole methodRequiresRole = method.getAnnotation(RequiresRole.class);
        RequiresRole classRequiresRole = clazz.getAnnotation(RequiresRole.class);

        RequiresRole requiresRole = methodRequiresRole != null ? methodRequiresRole : classRequiresRole;

        String authHeader = request.getHeader(AUTHORIZATION_HEADER);
        
        if (authHeader == null || !authHeader.startsWith(BEARER_PREFIX)) {
            if (requiresRole != null) {
                throw new BusinessException(401, "未登录或token无效");
            }
            return true;
        }

        String token = authHeader.substring(BEARER_PREFIX.length());
        
        if (!jwtUtil.validateToken(token)) {
            throw new BusinessException(401, "token已过期或无效");
        }

        Long userId = jwtUtil.getUserIdFromToken(token);
        String username = jwtUtil.getUsernameFromToken(token);
        
        request.setAttribute("userId", userId);
        request.setAttribute("username", username);

        if (requiresRole != null) {
            List<String> userRoles = userRoleMapper.selectRoleCodesByUserId(userId);
            String[] requiredRoles = requiresRole.value();
            RequiresRole.Logical logical = requiresRole.logical();

            boolean hasPermission;
            if (logical == RequiresRole.Logical.AND) {
                hasPermission = userRoles.containsAll(Arrays.asList(requiredRoles));
            } else {
                hasPermission = Arrays.stream(requiredRoles).anyMatch(userRoles::contains);
            }

            if (!hasPermission) {
                throw new BusinessException(403, "权限不足，需要角色: " + String.join(", ", requiredRoles));
            }
        }
        
        return true;
    }
}
