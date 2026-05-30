package com.rotor.manufacture.aspect;

import com.rotor.manufacture.annotation.RequiresRole;
import com.rotor.manufacture.common.ResultCodeEnum;
import com.rotor.manufacture.context.UserContext;
import com.rotor.manufacture.exception.BusinessException;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Aspect
@Component
public class PermissionAspect {

    @Pointcut("@annotation(com.rotor.manufacture.annotation.RequiresRole)")
    public void permissionPointcut() {
    }

    @Before("permissionPointcut() && @annotation(requiresRole)")
    public void checkPermission(RequiresRole requiresRole) {
        String userRole = UserContext.getRole();
        if (userRole == null) {
            throw new BusinessException(ResultCodeEnum.UNAUTHORIZED);
        }

        List<String> requiredRoles = Arrays.asList(requiresRole.value());
        if (!requiredRoles.contains(userRole)) {
            throw new BusinessException(ResultCodeEnum.FORBIDDEN);
        }
    }
}