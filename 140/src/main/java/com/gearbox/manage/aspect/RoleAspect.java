package com.gearbox.manage.aspect;

import com.gearbox.manage.annotation.RequiresRole;
import com.gearbox.manage.context.UserContext;
import com.gearbox.manage.exception.BusinessException;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Slf4j
@Aspect
@Component
public class RoleAspect {

    @Before("@annotation(requiresRole)")
    public void checkRole(RequiresRole requiresRole) {
        String currentRole = UserContext.getRole();
        if (currentRole == null) {
            throw new BusinessException("未登录或登录已过期，请重新登录");
        }

        String[] allowedRoles = requiresRole.value();
        boolean hasPermission = Arrays.asList(allowedRoles).contains(currentRole);
        
        if (!hasPermission) {
            log.warn("用户角色{}无权限访问，需要角色{}", currentRole, Arrays.toString(allowedRoles));
            throw new BusinessException("权限不足，无法执行此操作");
        }
    }
}
