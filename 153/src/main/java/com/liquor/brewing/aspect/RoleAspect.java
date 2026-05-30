package com.liquor.brewing.aspect;

import com.liquor.brewing.annotation.RequiresRole;
import com.liquor.brewing.common.ResultCode;
import com.liquor.brewing.exception.BusinessException;
import com.liquor.brewing.util.UserContext;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;

@Slf4j
@Aspect
@Component
@Order(1)
public class RoleAspect {

    @Around("@annotation(com.liquor.brewing.annotation.RequiresRole) || @within(com.liquor.brewing.annotation.RequiresRole)")
    public Object around(ProceedingJoinPoint joinPoint) throws Throwable {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        Class<?> targetClass = joinPoint.getTarget().getClass();

        RequiresRole methodAnnotation = method.getAnnotation(RequiresRole.class);
        RequiresRole classAnnotation = targetClass.getAnnotation(RequiresRole.class);

        RequiresRole annotation = methodAnnotation != null ? methodAnnotation : classAnnotation;

        if (annotation != null) {
            String[] requiredRoles = annotation.value();
            String userRole = UserContext.getRoleCode();

            if (userRole == null) {
                throw new BusinessException(ResultCode.UNAUTHORIZED);
            }

            boolean hasPermission = false;
            for (String role : requiredRoles) {
                if (role.equals(userRole)) {
                    hasPermission = true;
                    break;
                }
            }

            if (!hasPermission) {
                log.warn("用户[{}]角色[{}]无权限访问，需要角色[{}]",
                        UserContext.getUsername(), userRole, String.join(",", requiredRoles));
                throw new BusinessException(ResultCode.FORBIDDEN.getCode(), annotation.message());
            }
        }

        return joinPoint.proceed();
    }
}
