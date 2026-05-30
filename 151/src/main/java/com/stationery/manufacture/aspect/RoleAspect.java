package com.stationery.manufacture.aspect;

import com.stationery.manufacture.common.BusinessException;
import com.stationery.manufacture.common.ErrorCode;
import com.stationery.manufacture.common.RequireRole;
import com.stationery.manufacture.common.UserContext;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;
import java.util.Arrays;

@Aspect
@Component
public class RoleAspect {

    @Around("@within(com.stationery.manufacture.common.RequireRole) || @annotation(com.stationery.manufacture.common.RequireRole)")
    public Object around(ProceedingJoinPoint point) throws Throwable {
        MethodSignature signature = (MethodSignature) point.getSignature();
        Method method = signature.getMethod();

        RequireRole methodAnnotation = method.getAnnotation(RequireRole.class);
        RequireRole classAnnotation = method.getDeclaringClass().getAnnotation(RequireRole.class);

        String[] requiredRoles = {};
        if (methodAnnotation != null) {
            requiredRoles = methodAnnotation.value();
        } else if (classAnnotation != null) {
            requiredRoles = classAnnotation.value();
        }

        if (requiredRoles.length > 0) {
            String userRole = UserContext.getCurrentRole();
            boolean hasPermission = Arrays.asList(requiredRoles).contains(userRole);
            if (!hasPermission) {
                throw new BusinessException(ErrorCode.FORBIDDEN);
            }
        }

        return point.proceed();
    }
}
