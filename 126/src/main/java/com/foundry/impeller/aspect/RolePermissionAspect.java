package com.foundry.impeller.aspect;

import com.foundry.impeller.annotation.RequiresRole;
import com.foundry.impeller.exception.BusinessException;
import com.foundry.impeller.util.UserContext;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Aspect
@Component
public class RolePermissionAspect {

    @Around("@annotation(com.foundry.impeller.annotation.RequiresRole) || @within(com.foundry.impeller.annotation.RequiresRole)")
    public Object checkRole(ProceedingJoinPoint joinPoint) throws Throwable {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        RequiresRole methodAnnotation = signature.getMethod().getAnnotation(RequiresRole.class);
        RequiresRole classAnnotation = joinPoint.getTarget().getClass().getAnnotation(RequiresRole.class);

        String[] requiredRoles;
        if (methodAnnotation != null) {
            requiredRoles = methodAnnotation.value();
        } else if (classAnnotation != null) {
            requiredRoles = classAnnotation.value();
        } else {
            return joinPoint.proceed();
        }

        String currentRole = UserContext.getRole();
        if (currentRole == null) {
            throw new BusinessException(401, "用户未登录");
        }

        boolean hasPermission = Arrays.asList(requiredRoles).contains(currentRole);
        if (!hasPermission) {
            throw new BusinessException(403, "权限不足，需要角色：" + Arrays.toString(requiredRoles));
        }

        return joinPoint.proceed();
    }
}
