package com.paper.production.aspect;

import com.paper.production.annotation.RequiresRoles;
import com.paper.production.enums.RoleEnum;
import com.paper.production.exception.PermissionDeniedException;
import com.paper.production.utils.UserContextUtil;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;
import java.util.Arrays;

@Slf4j
@Aspect
@Component
public class PermissionAspect {

    @Around("@annotation(requiresRoles)")
    public Object around(ProceedingJoinPoint point, RequiresRoles requiresRoles) throws Throwable {
        String userRole = UserContextUtil.getRole();
        if (userRole == null) {
            throw new PermissionDeniedException("用户未登录或角色信息不存在");
        }

        RoleEnum[] allowedRoles = requiresRoles.value();
        RequiresRoles.Logical logical = requiresRoles.logical();

        boolean hasPermission = false;

        if (logical == RequiresRoles.Logical.OR) {
            hasPermission = Arrays.stream(allowedRoles)
                    .anyMatch(role -> role.getCode().equals(userRole) || RoleEnum.ADMIN.getCode().equals(userRole));
        } else {
            hasPermission = Arrays.stream(allowedRoles)
                    .allMatch(role -> role.getCode().equals(userRole) || RoleEnum.ADMIN.getCode().equals(userRole));
        }

        if (!hasPermission) {
            throw new PermissionDeniedException("权限不足，无法执行该操作");
        }

        return point.proceed();
    }

    @Around("@within(requiresRoles)")
    public Object aroundClass(ProceedingJoinPoint point, RequiresRoles requiresRoles) throws Throwable {
        MethodSignature signature = (MethodSignature) point.getSignature();
        Method method = signature.getMethod();
        if (method.isAnnotationPresent(RequiresRoles.class)) {
            return point.proceed();
        }
        return around(point, requiresRoles);
    }
}
