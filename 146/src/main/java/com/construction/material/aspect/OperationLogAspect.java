package com.construction.material.aspect;

import com.construction.material.annotation.OperationLog;
import com.construction.material.common.UserContext;
import com.construction.material.entity.OperationLogEntity;
import com.construction.material.mapper.OperationLogMapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;

@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class OperationLogAspect {

    private final OperationLogMapper operationLogMapper;
    private final ObjectMapper objectMapper;

    @Around("@annotation(operationLog)")
    public Object around(ProceedingJoinPoint joinPoint, OperationLog operationLog) throws Throwable {
        long startTime = System.currentTimeMillis();
        Object result;
        int status = 1;
        String errorMsg = null;

        try {
            result = joinPoint.proceed();
        } catch (Throwable e) {
            status = 0;
            errorMsg = e.getMessage();
            throw e;
        } finally {
            long costTime = System.currentTimeMillis() - startTime;
            saveLog(joinPoint, operationLog, costTime, status, errorMsg);
        }

        return result;
    }

    private void saveLog(ProceedingJoinPoint joinPoint, OperationLog operationLog, long costTime, int status, String errorMsg) {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            HttpServletRequest request = attributes != null ? attributes.getRequest() : null;

            MethodSignature signature = (MethodSignature) joinPoint.getSignature();
            String methodName = signature.getName();
            String className = joinPoint.getTarget().getClass().getName();

            Object[] args = joinPoint.getArgs();
            String params = null;
            try {
                params = objectMapper.writeValueAsString(args);
                if (params.length() > 2000) {
                    params = params.substring(0, 2000) + "...";
                }
            } catch (Exception e) {
                params = "参数解析失败";
            }

            OperationLogEntity logEntity = OperationLogEntity.builder()
                    .module(operationLog.module())
                    .operation(operationLog.operation())
                    .description(operationLog.description())
                    .method(className + "." + methodName)
                    .requestUri(request != null ? request.getRequestURI() : null)
                    .requestMethod(request != null ? request.getMethod() : null)
                    .ip(getIpAddress(request))
                    .params(params)
                    .costTime(costTime)
                    .status(status)
                    .errorMsg(errorMsg)
                    .operateBy(UserContext.getUserId())
                    .operateTime(LocalDateTime.now())
                    .build();

            operationLogMapper.insert(logEntity);
        } catch (Exception e) {
            log.error("保存操作日志失败: {}", e.getMessage(), e);
        }
    }

    private String getIpAddress(HttpServletRequest request) {
        if (request == null) {
            return null;
        }
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
