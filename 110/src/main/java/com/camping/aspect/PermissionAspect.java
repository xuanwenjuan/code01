package com.camping.aspect;

import com.camping.annotation.RequiresRole;
import com.camping.context.UserContext;
import com.camping.enums.RoleEnum;
import com.camping.exception.BusinessException;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Slf4j
@Aspect
@Component
public class PermissionAspect {

    @Around("@annotation(com.camping.annotation.RequiresRole) || @within(com.camping.annotation.RequiresRole)")
    public Object checkPermission(ProceedingJoinPoint joinPoint) throws Throwable {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        
        RequiresRole methodAnnotation = signature.getMethod().getAnnotation(RequiresRole.class);
        RequiresRole classAnnotation = signature.getMethod().getDeclaringClass().getAnnotation(RequiresRole.class);
        
        RequiresRole annotation = methodAnnotation != null ? methodAnnotation : classAnnotation;
        
        if (annotation != null) {
            Integer currentRole = UserContext.getRole();
            if (currentRole == null) {
                throw new BusinessException(401, "未获取到用户角色信息");
            }
            
            RoleEnum[] requiredRoles = annotation.value();
            boolean hasPermission = Arrays.stream(requiredRoles)
                    .anyMatch(role -> role.getCode().equals(currentRole));
            
            if (!hasPermission) {
                throw new BusinessException(403, "无权限访问该资源");
            }
        }
        
        return joinPoint.proceed();
    }
}
