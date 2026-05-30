package com.valve.manufacture.aspect;

import com.valve.manufacture.service.OperationLogService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;

@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class OperationLogAspect {

    private final OperationLogService operationLogService;
    private final HttpServletRequest request;

    @Pointcut("execution(* com.valve.manufacture.controller.*.*(..))")
    public void controllerPointcut() {
    }

    @AfterReturning(pointcut = "controllerPointcut()", returning = "result")
    public void afterReturning(JoinPoint joinPoint, Object result) {
        try {
            String methodName = joinPoint.getSignature().getName();
            String className = joinPoint.getTarget().getClass().getSimpleName();
            String operationType = resolveOperationType(methodName);
            String moduleName = resolveModuleName(className);

            Long operatorId = (Long) request.getAttribute("userId");
            String operatorName = (String) request.getAttribute("username");
            String ipAddress = getClientIp();

            operationLogService.log(operationType, moduleName, null, null,
                    operatorId, operatorName, className + "." + methodName, ipAddress);

        } catch (Exception e) {
            log.error("记录操作日志异常", e);
        }
    }

    private String resolveOperationType(String methodName) {
        if (methodName.startsWith("create") || methodName.startsWith("save") || methodName.startsWith("add")
                || methodName.startsWith("inbound")) {
            return "新增";
        } else if (methodName.startsWith("update") || methodName.startsWith("edit")) {
            return "修改";
        } else if (methodName.startsWith("delete") || methodName.startsWith("remove")) {
            return "删除";
        } else if (methodName.startsWith("get") || methodName.startsWith("list") || methodName.startsWith("page")
                || methodName.startsWith("query") || methodName.startsWith("find")) {
            return "查询";
        } else if (methodName.startsWith("confirm") || methodName.startsWith("complete")) {
            return "审核";
        } else if (methodName.startsWith("use") || methodName.startsWith("receive")) {
            return "领用";
        } else {
            return "其他";
        }
    }

    private String resolveModuleName(String className) {
        if (className.contains("Material")) {
            return "原料管理";
        } else if (className.contains("WorkOrder")) {
            return "生产工单";
        } else if (className.contains("ProductionCost")) {
            return "生产成本";
        } else if (className.contains("QualityInspection")) {
            return "质量检验";
        } else if (className.contains("ProductCategory")) {
            return "产品分类";
        } else if (className.contains("OperationLog")) {
            return "操作日志";
        } else if (className.contains("Auth") || className.contains("User")) {
            return "用户管理";
        } else {
            return "其他模块";
        }
    }

    private String getClientIp() {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }
}
