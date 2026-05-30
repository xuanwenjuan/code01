package com.battery.shell.aspect;

import com.battery.shell.annotation.Log;
import com.battery.shell.common.UserContext;
import com.battery.shell.entity.OperationLog;
import com.battery.shell.mapper.OperationLogMapper;
import com.fasterxml.jackson.databind.ObjectMapper;
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

@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class LogAspect {

    private final OperationLogMapper operationLogMapper;
    private final ObjectMapper objectMapper;

    @Pointcut("@annotation(com.battery.shell.annotation.Log)")
    public void logPointCut() {
    }

    @Around("logPointCut()")
    public Object around(ProceedingJoinPoint point) throws Throwable {
        long beginTime = System.currentTimeMillis();
        Object result = point.proceed();
        long time = System.currentTimeMillis() - beginTime;

        try {
            saveOperationLog(point, result, time);
        } catch (Exception e) {
            log.error("保存操作日志失败", e);
        }

        return result;
    }

    private void saveOperationLog(ProceedingJoinPoint joinPoint, Object result, long time) {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();

        OperationLog operationLog = new OperationLog();

        Log logAnnotation = method.getAnnotation(Log.class);
        if (logAnnotation != null) {
            operationLog.setOperation(logAnnotation.value());
            operationLog.setModule(logAnnotation.module());
        }

        Long userId = UserContext.getUserId();
        String username = UserContext.getUsername();
        if (userId != null) {
            operationLog.setUserId(userId);
            operationLog.setUsername(username);
        }

        HttpServletRequest request = getRequest();
        if (request != null) {
            String ip = getIpAddr(request);
            operationLog.setIp(ip);
        }

        String className = joinPoint.getTarget().getClass().getName();
        String methodName = signature.getName();

        Object[] args = joinPoint.getArgs();
        try {
            String params = objectMapper.writeValueAsString(args);
            operationLog.setRequestParams(params);
        } catch (Exception e) {
            log.warn("序列化请求参数失败", e);
        }

        try {
            String response = objectMapper.writeValueAsString(result);
            operationLog.setResponseData(response);
        } catch (Exception e) {
            log.warn("序列化响应数据失败", e);
        }

        operationLogMapper.insert(operationLog);
    }

    private HttpServletRequest getRequest() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        return attributes != null ? attributes.getRequest() : null;
    }

    private String getIpAddr(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
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
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }
}
