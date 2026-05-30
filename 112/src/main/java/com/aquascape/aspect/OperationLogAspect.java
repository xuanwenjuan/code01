package com.aquascape.aspect;

import com.aquascape.annotation.OperationLog;
import com.aquascape.entity.OperationLog;
import com.aquascape.mapper.OperationLogMapper;
import com.fasterxml.jackson.databind.ObjectMapper;
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

    @Pointcut("@annotation(com.aquascape.annotation.OperationLog)")
    public void logPointCut() {
    }

    @Around("logPointCut() && @annotation(operationLog)")
    public Object around(ProceedingJoinPoint point, OperationLog operationLog) throws Throwable {
        long beginTime = System.currentTimeMillis();
        Object result = null;
        Exception exception = null;

        try {
            result = point.proceed();
            return result;
        } catch (Exception e) {
            exception = e;
            throw e;
        } finally {
            long time = System.currentTimeMillis() - beginTime;
            saveLog(point, operationLog, exception, time);
        }
    }

    private void saveLog(ProceedingJoinPoint point, OperationLog operationLog, Exception exception, long time) {
        try {
            HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest();

            OperationLog logEntity = new OperationLog();

            String userIdStr = (String) request.getAttribute("userId");
            if (userIdStr != null) {
                logEntity.setUserId(Long.parseLong(userIdStr));
            }

            String username = (String) request.getAttribute("username");
            logEntity.setUsername(username != null ? username : "system");

            logEntity.setModule(operationLog.module());
            logEntity.setOperation(operationLog.operation());

            String className = point.getTarget().getClass().getName();
            String methodName = point.getSignature().getName();
            logEntity.setMethod(className + "." + methodName);

            Object[] args = point.getArgs();
            if (args != null && args.length > 0) {
                try {
                    String params = objectMapper.writeValueAsString(args);
                    logEntity.setParams(params.length() > 2000 ? params.substring(0, 2000) : params);
                } catch (Exception e) {
                    logEntity.setParams("参数序列化失败");
                }
            }

            logEntity.setIp(getIpAddr(request));
            logEntity.setStatus(exception == null ? 1 : 0);

            if (exception != null) {
                String errorMsg = exception.getMessage();
                logEntity.setErrorMsg(errorMsg != null && errorMsg.length() > 500 ? errorMsg.substring(0, 500) : errorMsg);
            }

            logEntity.setCreateTime(LocalDateTime.now());
            operationLogMapper.insert(logEntity);

        } catch (Exception e) {
            log.error("保存操作日志失败", e);
        }
    }

    private String getIpAddr(HttpServletRequest request) {
        String ip = request.getHeader("x-forwarded-for");
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_CLIENT_IP");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_X_FORWARDED_FOR");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }
}
