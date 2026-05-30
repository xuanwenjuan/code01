package com.mining.maintenance.aspect;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mining.maintenance.annotation.Log;
import com.mining.maintenance.context.UserContext;
import com.mining.maintenance.entity.OperationLog;
import com.mining.maintenance.mapper.OperationLogMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;

@Slf4j
@Aspect
@Component
public class OperationLogAspect {

    @Autowired
    private OperationLogMapper operationLogMapper;

    @Autowired
    private ObjectMapper objectMapper;

    @Pointcut("@annotation(com.mining.maintenance.annotation.Log)")
    public void logPointCut() {
    }

    @Around("logPointCut() && @annotation(logAnnotation)")
    public Object around(ProceedingJoinPoint joinPoint, Log logAnnotation) throws Throwable {
        long beginTime = System.currentTimeMillis();

        OperationLog operationLog = new OperationLog();
        operationLog.setOperationTime(LocalDateTime.now());
        operationLog.setOperationModule(logAnnotation.operationModule());
        operationLog.setOperationType(logAnnotation.operationType());
        operationLog.setOperationDesc(logAnnotation.operationDesc());

        UserContext.CurrentUser user = UserContext.getUser();
        if (user != null) {
            operationLog.setUserId(user.getUserId());
            operationLog.setUsername(user.getUsername());
            operationLog.setRole(user.getRole());
        }

        String methodName = joinPoint.getSignature().getName();
        operationLog.setMethodName(methodName);

        try {
            Object[] args = joinPoint.getArgs();
            if (args != null && args.length > 0) {
                String params = objectMapper.writeValueAsString(args);
                operationLog.setRequestParams(params.length() > 2000 ? params.substring(0, 2000) : params);
            }
        } catch (Exception e) {
            log.error("获取请求参数失败", e);
        }

        try {
            HttpServletRequest request = getRequest();
            if (request != null) {
                operationLog.setIpAddress(getIpAddress(request));
            }
        } catch (Exception e) {
            log.error("获取IP地址失败", e);
        }

        try {
            Object result = joinPoint.proceed();
            long duration = System.currentTimeMillis() - beginTime;
            operationLog.setDuration((int) duration);
            operationLog.setStatus(1);
            return result;
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - beginTime;
            operationLog.setDuration((int) duration);
            operationLog.setStatus(0);
            operationLog.setErrorMsg(e.getMessage() != null && e.getMessage().length() > 500
                    ? e.getMessage().substring(0, 500) : e.getMessage());
            throw e;
        } finally {
            try {
                operationLogMapper.insert(operationLog);
            } catch (Exception e) {
                log.error("保存操作日志失败", e);
            }
        }
    }

    private HttpServletRequest getRequest() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        return attributes != null ? attributes.getRequest() : null;
    }

    private String getIpAddress(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_CLIENT_IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_X_FORWARDED_FOR");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }
}