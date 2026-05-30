package com.flange.aspect;

import com.flange.annotation.RequiresRole;
import com.flange.common.RoleConstants;
import com.flange.exception.BusinessException;
import com.flange.util.UserContext;
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

    @Around("@annotation(com.flange.annotation.RequiresRole) || @within(com.flange.annotation.RequiresRole)")
    public Object checkPermission(ProceedingJoinPoint joinPoint) throws Throwable {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        Class<?> targetClass = joinPoint.getTarget().getClass();

        RequiresRole methodRequiresRole = method.getAnnotation(RequiresRole.class);
        RequiresRole classRequiresRole = targetClass.getAnnotation(RequiresRole.class);

        RequiresRole requiresRole = methodRequiresRole != null ? methodRequiresRole : classRequiresRole;

        if (requiresRole != null) {
            String userRole = UserContext.getRole();
            if (userRole == null) {
                throw new BusinessException(401, "用户未登录");
            }

            if (RoleConstants.ADMIN.equals(userRole)) {
                return joinPoint.proceed();
            }

            String[] requiredRoles = requiresRole.value();
            RequiresRole.Logical logical = requiresRole.logical();

            List<String> requiredRoleList = Arrays.asList(requiredRoles);
            boolean hasPermission;

            if (logical == RequiresRole.Logical.AND) {
                hasPermission = requiredRoleList.stream().allMatch(userRole::equals);
            } else {
                hasPermission = requiredRoleList.contains(userRole);
            }

            if (!hasPermission) {
                log.warn("用户[{}]角色[{}]尝试访问需要角色{}的资源，被拒绝",
                        UserContext.getUsername(), userRole, requiredRoleList);
                throw new BusinessException(403, "没有权限访问该资源，需要角色：" + requiredRoleList);
            }

            log.info("用户[{}]角色[{}]通过权限校验，访问资源：{}",
                    UserContext.getUsername(), userRole, method.getName());
        }

        return joinPoint.proceed();
    }
}
