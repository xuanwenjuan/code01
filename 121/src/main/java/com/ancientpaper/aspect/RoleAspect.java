package com.ancientpaper.aspect;

import com.ancientpaper.annotation.RequiresRole;
import com.ancientpaper.context.UserContext;
import com.ancientpaper.exception.BusinessException;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;

@Slf4j
@Aspect
@Component
public class RoleAspect {

    @Pointcut("@annotation(com.ancientpaper.annotation.RequiresRole) || @within(com.ancientpaper.annotation.RequiresRole)")
    public void rolePointCut() {
    }

    @Around("rolePointCut()")
    public Object around(ProceedingJoinPoint point) throws Throwable {
        MethodSignature signature = (MethodSignature) point.getSignature();
        Method method = signature.getMethod();
        Class<?> targetClass = point.getTarget().getClass();

        RequiresRole methodRequiresRole = method.getAnnotation(RequiresRole.class);
        RequiresRole classRequiresRole = targetClass.getAnnotation(RequiresRole.class);

        RequiresRole requiresRole = methodRequiresRole != null ? methodRequiresRole : classRequiresRole;

        if (requiresRole != null) {
            Integer currentRole = UserContext.getRole();
            if (currentRole == null) {
                throw new BusinessException(401, "用户未登录或登录已过期");
            }

            int[] requiredRoles = requiresRole.value();
            boolean hasPermission = false;
            for (int role : requiredRoles) {
                if (role == currentRole) {
                    hasPermission = true;
                    break;
                }
            }

            if (!hasPermission) {
                log.warn("用户ID:{} 角色:{} 无权限访问，需要角色:{}",
                    UserContext.getUserId(), currentRole, requiredRoles);
                throw new BusinessException(403, "权限不足，无法执行该操作");
            }
        }

        return point.proceed();
    }
}
