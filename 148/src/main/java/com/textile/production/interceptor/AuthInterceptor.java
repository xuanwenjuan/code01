package com.textile.production.interceptor;

import com.textile.production.annotation.RequiresRole;
import com.textile.production.common.ResultCode;
import com.textile.production.context.UserContext;
import com.textile.production.exception.BusinessException;
import com.textile.production.utils.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Arrays;

@Component
@RequiredArgsConstructor
public class AuthInterceptor implements HandlerInterceptor {

    private final JwtUtil jwtUtil;

    @Value("${jwt.header}")
    private String header;

    @Value("${jwt.prefix}")
    private String prefix;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if ("OPTIONS".equals(request.getMethod())) {
            return true;
        }

        if (!(handler instanceof HandlerMethod handlerMethod)) {
            return true;
        }

        String token = request.getHeader(header);
        if (token != null && token.startsWith(prefix)) {
            token = token.substring(prefix.length());
        }

        if (token == null || token.isEmpty()) {
            throw new BusinessException(ResultCode.UNAUTHORIZED);
        }

        try {
            Long userId = jwtUtil.getUserIdFromToken(token);
            String username = jwtUtil.getUsernameFromToken(token);
            String role = jwtUtil.getRoleFromToken(token);

            UserContext.set(new UserContext(userId, username, role));

            RequiresRole classRequiresRole = handlerMethod.getBeanType().getAnnotation(RequiresRole.class);
            RequiresRole methodRequiresRole = handlerMethod.getMethodAnnotation(RequiresRole.class);

            RequiresRole requiresRole = methodRequiresRole != null ? methodRequiresRole : classRequiresRole;

            if (requiresRole != null) {
                String[] allowedRoles = requiresRole.value();
                boolean hasPermission = Arrays.asList(allowedRoles).contains(role);
                if (!hasPermission) {
                    throw new BusinessException(ResultCode.FORBIDDEN);
                }
            }

            return true;
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            throw new BusinessException(ResultCode.TOKEN_INVALID);
        }
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        UserContext.remove();
    }
}
