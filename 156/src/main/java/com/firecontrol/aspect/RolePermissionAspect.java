package com.firecontrol.aspect;

import com.firecontrol.annotation.RequireRole;
import com.firecontrol.common.ResultCode;
import com.firecontrol.exception.BusinessException;
import com.firecontrol.utils.UserContextUtil;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.core.annotation.AnnotationUtils;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;
import java.util.Arrays;

@Slf4j
@Aspect
@Component
public class RolePermissionAspect {

    @Around("@annotation(com.firecontrol.annotation.RequireRole) || @within(com.firecontrol.annotation.RequireRole)")
    public Object around(ProceedingJoinPoint joinPoint) throws Throwable {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();

        RequireRole methodAnnotation = AnnotationUtils.findAnnotation(method, RequireRole.class);
        RequireRole classAnnotation = AnnotationUtils.findAnnotation(joinPoint.getTarget().getClass(), RequireRole.class);

        String currentRole = UserContextUtil.getRoleCode();
        if (currentRole == null) {
            throw new BusinessException(ResultCode.UNAUTHORIZED);
        }

        if ("ADMIN".equals(currentRole)) {
            return joinPoint.proceed();
        }

        if (methodAnnotation != null) {
            if (!checkRoles(methodAnnotation, currentRole)) {
                throw new BusinessException(ResultCode.FORBIDDEN);
            }
        } else if (classAnnotation != null) {
            if (!checkRoles(classAnnotation, currentRole)) {
                throw new BusinessException(ResultCode.FORBIDDEN);
            }
        }

        return joinPoint.proceed();
    }

    private boolean checkRoles(RequireRole requireRole, String currentRole) {
        String[] mustRoles = requireRole.value();
        if (mustRoles.length > 0) {
            return Arrays.asList(mustRoles).contains(currentRole);
        }

        String[] anyRoles = requireRole.anyRole();
        if (anyRoles.length > 0) {
            return Arrays.stream(anyRoles).anyMatch(currentRole::equals);
        }

        return true;
    }
}
