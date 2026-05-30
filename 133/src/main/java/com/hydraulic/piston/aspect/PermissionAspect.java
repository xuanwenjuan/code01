package com.hydraulic.piston.aspect;

import com.hydraulic.piston.annotation.RequiresRole;
import com.hydraulic.piston.common.RoleEnum;
import com.hydraulic.piston.exception.BusinessException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class PermissionAspect {

    public static final String MATERIAL_PURCHASER = "MATERIAL_PURCHASER";
    public static final String MACHINING_TECHNICIAN = "MACHINING_TECHNICIAN";
    public static final String CNC_TEAM_LEADER = "CNC_TEAM_LEADER";
    public static final String QUALITY_INSPECTOR = "QUALITY_INSPECTOR";
    public static final String ADMIN = "ADMIN";

    @Pointcut("@annotation(com.hydraulic.piston.annotation.RequiresRole)")
    public void permissionPointCut() {
    }

    @Around("permissionPointCut()")
    public Object around(ProceedingJoinPoint joinPoint) throws Throwable {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();

        RequiresRole requiresRole = method.getAnnotation(RequiresRole.class);
        if (requiresRole == null) {
            return joinPoint.proceed();
        }

        String[] requiredRoles = requiresRole.value();

        HttpServletRequest request = getRequest();
        if (request == null) {
            throw new BusinessException(401, "未获取到请求信息");
        }

        String userIdStr = (String) request.getAttribute("userId");
        String roleIdStr = (String) request.getAttribute("roleId");
        String username = (String) request.getAttribute("username");

        log.info("权限校验 - 用户ID: {}, 角色ID: {}, 需要角色: {}", userIdStr, roleIdStr, Arrays.toString(requiredRoles));

        if (roleIdStr == null) {
            throw new BusinessException(401, "未获取到用户角色信息");
        }

        Integer roleId = Integer.parseInt(roleIdStr);
        String userRole = getRoleCodeById(roleId);

        if (userRole == null) {
            throw new BusinessException(403, "用户角色不存在");
        }

        List<String> requiredRoleList = Arrays.asList(requiredRoles);
        if (!requiredRoleList.contains(userRole) && !requiredRoleList.contains(ADMIN)) {
            throw new BusinessException(403, "权限不足，无法执行此操作");
        }

        return joinPoint.proceed();
    }

    private String getRoleCodeById(Integer roleId) {
        if (roleId == null) {
            return null;
        }
        for (RoleEnum role : RoleEnum.values()) {
            if (role.getRoleId().equals(roleId)) {
                return role.name();
            }
        }
        return null;
    }

    private HttpServletRequest getRequest() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            return attributes != null ? attributes.getRequest() : null;
        } catch (Exception e) {
            return null;
        }
    }
}