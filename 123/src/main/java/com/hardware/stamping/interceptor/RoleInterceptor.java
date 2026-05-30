package com.hardware.stamping.interceptor;

import com.hardware.stamping.annotation.RequiresRole;
import com.hardware.stamping.exception.BusinessException;
import com.hardware.stamping.util.UserContext;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Arrays;
import java.util.List;

@Component
public class RoleInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if (!(handler instanceof HandlerMethod)) {
            return true;
        }

        HandlerMethod handlerMethod = (HandlerMethod) handler;
        RequiresRole methodAnnotation = handlerMethod.getMethodAnnotation(RequiresRole.class);
        RequiresRole classAnnotation = handlerMethod.getBeanType().getAnnotation(RequiresRole.class);

        if (methodAnnotation == null && classAnnotation == null) {
            return true;
        }

        String currentRole = UserContext.getRole();
        if (currentRole == null) {
            throw new BusinessException(401, "未获取到用户角色信息");
        }

        List<String> requiredRoles = methodAnnotation != null
                ? Arrays.asList(methodAnnotation.value())
                : Arrays.asList(classAnnotation.value());

        if (!requiredRoles.contains(currentRole)) {
            throw new BusinessException(403, "权限不足，需要角色：" + requiredRoles);
        }

        return true;
    }
}
