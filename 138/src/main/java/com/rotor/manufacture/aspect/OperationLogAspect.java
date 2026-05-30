package com.rotor.manufacture.aspect;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rotor.manufacture.context.UserContext;
import com.rotor.manufacture.entity.OperationLog;
import com.rotor.manufacture.mapper.OperationLogMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class OperationLogAspect {

    private final OperationLogMapper operationLogMapper;
    private final ObjectMapper objectMapper;

    @Pointcut("execution(* com.rotor.manufacture.controller..*.*(..))")
    public void operationLogPointcut() {
    }

    @Around("operationLogPointcut()")
    public Object around(ProceedingJoinPoint joinPoint) throws Throwable {
        long startTime = System.currentTimeMillis();

        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        HttpServletRequest request = attributes != null ? attributes.getRequest() : null;

        String className = joinPoint.getTarget().getClass().getSimpleName();
        String methodName = joinPoint.getSignature().getName();
        String module = className.replace("Controller", "");
        String operation = getOperationDescription(methodName);

        Object result;
        try {
            result = joinPoint.proceed();

            long endTime = System.currentTimeMillis();

            OperationLog operationLog = new OperationLog();
            operationLog.setUserId(UserContext.getUserId());
            operationLog.setUsername(UserContext.getUsername());
            operationLog.setModule(module);
            operationLog.setOperation(operation);
            operationLog.setMethod(className + "." + methodName);

            try {
                Object[] args = joinPoint.getArgs();
                if (args != null && args.length > 0) {
                    StringBuilder paramsStr = new StringBuilder();
                    for (Object arg : args) {
                        if (arg != null && !isIgnoredParam(arg)) {
                            paramsStr.append(objectMapper.writeValueAsString(arg)).append(";");
                        }
                    }
                    if (paramsStr.length() > 500) {
                        operationLog.setParams(paramsStr.substring(0, 500) + "...");
                    } else {
                        operationLog.setParams(paramsStr.toString());
                    }
                }
            } catch (Exception e) {
                log.warn("记录参数失败", e);
            }

            try {
                if (result != null) {
                    String resultStr = objectMapper.writeValueAsString(result);
                    if (resultStr.length() > 500) {
                        operationLog.setResult(resultStr.substring(0, 500) + "...");
                    } else {
                        operationLog.setResult(resultStr);
                    }
                }
            } catch (Exception e) {
                log.warn("记录结果失败", e);
            }

            operationLog.setTime(endTime - startTime);
            operationLog.setIp(request != null ? getClientIp(request) : "");

            operationLogMapper.insert(operationLog);

        } catch (Throwable throwable) {
            throw throwable;
        }

        return result;
    }

    private String getOperationDescription(String methodName) {
        if (methodName.startsWith("list") || methodName.startsWith("get") || methodName.startsWith("query")) {
            return "查询";
        } else if (methodName.startsWith("add") || methodName.startsWith("create") || methodName.startsWith("save")) {
            return "新增";
        } else if (methodName.startsWith("update") || methodName.startsWith("edit")) {
            return "修改";
        } else if (methodName.startsWith("delete") || methodName.startsWith("remove")) {
            return "删除";
        } else if (methodName.startsWith("login")) {
            return "登录";
        } else {
            return "操作";
        }
    }

    private boolean isIgnoredParam(Object param) {
        return param instanceof HttpServletRequest
                || param instanceof jakarta.servlet.http.HttpServletResponse
                || param instanceof org.springframework.web.multipart.MultipartFile;
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }
}