package com.construction.material.interceptor;

import com.construction.material.annotation.RequiresRole;
import com.construction.material.common.LoginUser;
import com.construction.material.common.UserContext;
import com.construction.material.exception.BusinessException;
import com.construction.material.utils.JwtUtils;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Arrays;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class AuthInterceptor implements HandlerInterceptor {

    private final JwtUtils jwtUtils;

    @Value("${jwt.header}")
    private String header;

    @Value("${jwt.prefix}")
    private String prefix;

    private static final List<String> EXCLUDE_PATHS = Arrays.asList(
            "/auth/login",
            "/auth/register"
    );

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String requestUri = request.getRequestURI();
        String contextPath = request.getContextPath();
        String path = requestUri.substring(contextPath.length());

        if (EXCLUDE_PATHS.contains(path)) {
            return true;
        }

        if (!(handler instanceof HandlerMethod)) {
            return true;
        }

        String token = request.getHeader(header);
        if (token == null || token.isEmpty()) {
            throw new BusinessException(401, "未登录，请先登录");
        }

        if (token.startsWith(prefix)) {
            token = token.substring(prefix.length()).trim();
        }

        if (!jwtUtils.validateToken(token)) {
            throw new BusinessException(401, "Token已过期或无效，请重新登录");
        }

        Claims claims = jwtUtils.parseToken(token);
        if (claims == null) {
            throw new BusinessException(401, "Token解析失败");
        }

        Long userId = Long.valueOf(claims.get("userId").toString());
        String username = claims.get("username").toString();
        String role = claims.get("role").toString();

        LoginUser loginUser = LoginUser.builder()
                .userId(userId)
                .username(username)
                .role(role)
                .build();
        UserContext.set(loginUser);

        checkRolePermission((HandlerMethod) handler, role);

        return true;
    }

    private void checkRolePermission(HandlerMethod handlerMethod, String userRole) {
        RequiresRole methodAnnotation = handlerMethod.getMethodAnnotation(RequiresRole.class);
        RequiresRole classAnnotation = handlerMethod.getBeanType().getAnnotation(RequiresRole.class);

        RequiresRole requiresRole = methodAnnotation != null ? methodAnnotation : classAnnotation;

        if (requiresRole == null) {
            return;
        }

        String[] requiredRoles = requiresRole.value();
        boolean requireAll = requiresRole.requireAll();

        if (requireAll) {
            for (String role : requiredRoles) {
                if (!role.equals(userRole)) {
                    throw new BusinessException(403, "权限不足，无法访问该资源");
                }
            }
        } else {
            boolean hasPermission = false;
            for (String role : requiredRoles) {
                if (role.equals(userRole)) {
                    hasPermission = true;
                    break;
                }
            }
            if (!hasPermission) {
                throw new BusinessException(403, "权限不足，无法访问该资源");
            }
        }
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        UserContext.remove();
    }
}
