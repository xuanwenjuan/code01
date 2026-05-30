package com.instrument.consignment.aspect;

import com.instrument.consignment.annotation.RequiresRole;
import com.instrument.consignment.enums.UserRoleEnum;
import com.instrument.consignment.exception.BusinessException;
import com.instrument.consignment.util.UserContext;
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

    @Around("@annotation(com.instrument.consignment.annotation.RequiresRole) || @within(com.instrument.consignment.annotation.RequiresRole)")
    public Object checkPermission(ProceedingJoinPoint joinPoint) throws Throwable {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();

        RequiresRole methodAnnotation = method.getAnnotation(RequiresRole.class);
        RequiresRole classAnnotation = joinPoint.getTarget().getClass().getAnnotation(RequiresRole.class);

        RequiresRole annotation = methodAnnotation != null ? methodAnnotation : classAnnotation;

        if (annotation != null) {
            String currentRole = UserContext.getRole();
            if (currentRole == null) {
                throw new BusinessException(401, "用户未登录");
            }

            UserRoleEnum[] requiredRoles = annotation.value();
            boolean hasPermission = Arrays.stream(requiredRoles)
                    .anyMatch(role -> role.getCode().equals(currentRole));

            if (!hasPermission) {
                throw new BusinessException(403, "无权限访问该资源");
            }
        }

        return joinPoint.proceed();
    }
}
