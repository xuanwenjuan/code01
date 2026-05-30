package com.zongshi.brush.interceptor;

import com.zongshi.brush.annotation.RequiresRoles;
import com.zongshi.brush.exception.BusinessException;
import com.zongshi.brush.util.JwtUtil;
import com.zongshi.brush.util.UserContext;
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
public class JwtInterceptor implements HandlerInterceptor {

    private final JwtUtil jwtUtil;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if (!(handler instanceof HandlerMethod)) {
            return true;
        }

        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
            if (jwtUtil.validateToken(token)) {
                Long userId = jwtUtil.getUserIdFromToken(token);
                String username = jwtUtil.getUsernameFromToken(token);
                UserContext.setUserId(userId);
                UserContext.setUsername(username);

                HandlerMethod handlerMethod = (HandlerMethod) handler;
                RequiresRoles requiresRoles = handlerMethod.getMethodAnnotation(RequiresRoles.class);
                if (requiresRoles == null) {
                    requiresRoles = handlerMethod.getBeanType().getAnnotation(RequiresRoles.class);
                }

                if (requiresRoles != null && requiresRoles.value().length > 0) {
                    List<String> userRoles = jwtUtil.getRolesFromToken(token);
                    boolean hasRole = Arrays.stream(requiresRoles.value())
                            .anyMatch(userRoles::contains);
                    if (!hasRole) {
                        throw new BusinessException(403, "权限不足，无法访问");
                    }
                }
                return true;
            }
        }
        throw new BusinessException(401, "未登录或token已过期");
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        UserContext.clear();
    }
}
