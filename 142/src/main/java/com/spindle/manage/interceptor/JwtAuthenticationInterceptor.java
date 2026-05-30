package com.spindle.manage.interceptor;

import com.spindle.manage.annotation.RequiresPermission;
import com.spindle.manage.exception.BusinessException;
import com.spindle.manage.mapper.SysUserMapper;
import com.spindle.manage.utils.JwtUtil;
import com.spindle.manage.utils.UserContext;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationInterceptor implements HandlerInterceptor {

    private final JwtUtil jwtUtil;
    private final SysUserMapper sysUserMapper;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if (!(handler instanceof HandlerMethod)) {
            return true;
        }

        String token = request.getHeader("Authorization");
        if (token == null || !token.startsWith("Bearer ")) {
            throw new BusinessException(401, "未登录，请先登录");
        }

        token = token.substring(7);
        if (!jwtUtil.validateToken(token)) {
            throw new BusinessException(401, "token已过期，请重新登录");
        }

        Long userId = jwtUtil.getUserIdFromToken(token);
        String username = jwtUtil.getUsernameFromToken(token);
        UserContext.setUserId(userId);
        UserContext.setUsername(username);

        HandlerMethod handlerMethod = (HandlerMethod) handler;
        RequiresPermission requiresPermission = handlerMethod.getMethodAnnotation(RequiresPermission.class);
        if (requiresPermission != null) {
            String[] requiredPermissions = requiresPermission.value();
            List<String> userPermissions = sysUserMapper.selectPermissionCodesByUserId(userId);

            boolean hasPermission = false;
            for (String permission : requiredPermissions) {
                if (userPermissions.contains(permission)) {
                    hasPermission = true;
                    break;
                }
            }

            if (!hasPermission) {
                throw new BusinessException(403, "权限不足，无法访问");
            }
        }

        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        UserContext.clear();
    }

}
