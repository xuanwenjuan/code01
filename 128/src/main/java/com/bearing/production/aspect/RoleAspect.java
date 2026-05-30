package com.bearing.production.aspect;

import com.bearing.production.annotation.RequiresRole;
import com.bearing.production.context.UserContext;
import com.bearing.production.exception.BusinessException;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Aspect
@Component
public class RoleAspect {

    @Pointcut("@annotation(com.bearing.production.annotation.RequiresRole)")
    public void rolePointcut() {
    }

    @Before("rolePointcut() && @annotation(requiresRole)")
    public void checkRole(RequiresRole requiresRole) {
        Integer userRole = UserContext.getRole();
        if (userRole == null) {
            throw new BusinessException(401, "请先登录");
        }

        int[] allowedRoles = requiresRole.value();
        boolean hasPermission = Arrays.stream(allowedRoles).anyMatch(role -> role == userRole);

        if (!hasPermission) {
            throw new BusinessException(403, "权限不足，无法执行此操作");
        }
    }
}
