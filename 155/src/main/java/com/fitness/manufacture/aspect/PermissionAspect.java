package com.fitness.manufacture.aspect;

import com.fitness.manufacture.annotation.RequiresRoles;
import com.fitness.manufacture.common.BusinessException;
import com.fitness.manufacture.common.ResultCode;
import com.fitness.manufacture.common.UserContextHolder;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;
import java.util.List;

@Aspect
@Component
@RequiredArgsConstructor
public class PermissionAspect {

    @Around("@annotation(com.fitness.manufacture.annotation.RequiresRoles)")
    public Object checkPermission(ProceedingJoinPoint joinPoint) throws Throwable {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        RequiresRoles requiresRoles = method.getAnnotation(RequiresRoles.class);

        if (requiresRoles == null) {
            return joinPoint.proceed();
        }

        String userPostCode = UserContextHolder.getPostCode();
        List<String> userRoleCodes = UserContextHolder.getRoleCodes();

        boolean hasPermission = false;

        if (requiresRoles.postCodes().length > 0) {
            for (String postCode : requiresRoles.postCodes()) {
                if (postCode.equals(userPostCode)) {
                    hasPermission = true;
                    break;
                }
            }
        }

        if (requiresRoles.value().length > 0) {
            for (String roleCode : requiresRoles.value()) {
                if (userRoleCodes != null && userRoleCodes.contains(roleCode)) {
                    hasPermission = true;
                    break;
                }
            }
        }

        if ((requiresRoles.postCodes().length == 0 && requiresRoles.value().length == 0) {
            hasPermission = true;
        }

        if (!hasPermission) {
            throw new BusinessException(ResultCode.FORBIDDEN, "权限不足，无法执行该操作");
        }

        return joinPoint.proceed();
    }
}
