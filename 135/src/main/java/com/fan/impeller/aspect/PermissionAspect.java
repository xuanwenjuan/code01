package com.fan.impeller.aspect;

import com.fan.impeller.annotation.RequiresRole;
import com.fan.impeller.common.Constants;
import com.fan.impeller.context.UserContext;
import com.fan.impeller.exception.BusinessException;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Aspect
@Component
public class PermissionAspect {

    @Around("@annotation(com.fan.impeller.annotation.RequiresRole) || @within(com.fan.impeller.annotation.RequiresRole)")
    public Object checkPermission(ProceedingJoinPoint point) throws Throwable {
        MethodSignature signature = (MethodSignature) point.getSignature();
        Method method = signature.getMethod();
        
        RequiresRole methodAnnotation = method.getAnnotation(RequiresRole.class);
        RequiresRole classAnnotation = point.getTarget().getClass().getAnnotation(RequiresRole.class);
        
        String[] requiredRoles = null;
        if (methodAnnotation != null) {
            requiredRoles = methodAnnotation.value();
        } else if (classAnnotation != null) {
            requiredRoles = classAnnotation.value();
        }
        
        if (requiredRoles != null && requiredRoles.length > 0) {
            String currentUserRole = UserContext.getRole();
            if (currentUserRole == null) {
                throw new BusinessException(401, "用户未登录");
            }
            
            List<String> requiredRoleList = Arrays.asList(requiredRoles);
            if (!requiredRoleList.contains(currentUserRole) && !Constants.ROLE_ADMIN.equals(currentUserRole)) {
                throw new BusinessException(403, "权限不足，需要角色：" + requiredRoleList);
            }
        }
        
        return point.proceed();
    }
}
