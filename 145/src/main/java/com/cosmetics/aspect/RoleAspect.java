package com.cosmetics.aspect;

import com.cosmetics.annotation.RequireRole;
import com.cosmetics.common.ResultCode;
import com.cosmetics.context.UserContext;
import com.cosmetics.enums.UserRoleEnum;
import com.cosmetics.exception.BusinessException;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.core.annotation.AnnotationUtils;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;

@Aspect
@Component
public class RoleAspect {

    @Around("@within(com.cosmetics.annotation.RequireRole) || @annotation(com.cosmetics.annotation.RequireRole)")
    public Object around(ProceedingJoinPoint joinPoint) throws Throwable {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();

        RequireRole methodAnnotation = AnnotationUtils.findAnnotation(method, RequireRole.class);
        RequireRole classAnnotation = AnnotationUtils.findAnnotation(joinPoint.getTarget().getClass(), RequireRole.class);

        RequireRole requireRole = methodAnnotation != null ? methodAnnotation : classAnnotation;

        if (requireRole != null) {
            Integer userRole = UserContext.getRole();
            if (userRole == null) {
                throw new BusinessException(ResultCode.UNAUTHORIZED);
            }

            boolean hasPermission = false;
            for (UserRoleEnum roleEnum : requireRole.value()) {
                if (roleEnum.getCode().equals(userRole)) {
                    hasPermission = true;
                    break;
                }
            }

            if (!hasPermission) {
                throw new BusinessException(ResultCode.FORBIDDEN);
            }
        }

        return joinPoint.proceed();
    }
}
