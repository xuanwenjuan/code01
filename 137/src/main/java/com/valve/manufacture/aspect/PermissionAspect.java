package com.valve.manufacture.aspect;

import com.valve.manufacture.annotation.RequiresRole;
import com.valve.manufacture.exception.BusinessException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class PermissionAspect {

    private final HttpServletRequest request;

    @Before("@annotation(com.valve.manufacture.annotation.RequiresRole) || @within(com.valve.manufacture.annotation.RequiresRole)")
    public void checkPermission(JoinPoint joinPoint) {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        RequiresRole methodAnnotation = signature.getMethod().getAnnotation(RequiresRole.class);
        RequiresRole classAnnotation = joinPoint.getTarget().getClass().getAnnotation(RequiresRole.class);

        String[] requiredRoles = null;
        if (methodAnnotation != null) {
            requiredRoles = methodAnnotation.value();
        } else if (classAnnotation != null) {
            requiredRoles = classAnnotation.value();
        }

        if (requiredRoles == null || requiredRoles.length == 0) {
            return;
        }

        String userRole = (String) request.getAttribute("role");
        if (userRole == null) {
            throw new BusinessException(401, "未获取到用户角色信息");
        }

        List<String> roleList = Arrays.asList(requiredRoles);
        if (!roleList.contains(userRole)) {
            log.warn("用户角色{}无权限访问：{}", userRole, joinPoint.getSignature().getName());
            throw new BusinessException(403, "权限不足，需要角色：" + String.join(",", requiredRoles));
        }
    }
}
