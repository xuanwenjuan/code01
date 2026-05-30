package com.horncomb.aspect;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.horncomb.annotation.OperationLog;
import com.horncomb.common.UserContext;
import com.horncomb.entity.OperationLogEntity;
import com.horncomb.mapper.OperationLogMapper;
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
import java.time.LocalDateTime;

@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class OperationLogAspect {

    private final OperationLogMapper operationLogMapper;
    private final ObjectMapper objectMapper;

    @Pointcut("@annotation(com.horncomb.annotation.OperationLog)")
    public void logPointcut() {
    }

    @Around("logPointcut() && @annotation(operationLog)")
    public Object around(ProceedingJoinPoint joinPoint, OperationLog operationLog) throws Throwable {
        long startTime = System.currentTimeMillis();

        HttpServletRequest request = getRequest();
        OperationLogEntity logEntity = new OperationLogEntity();

        try {
            logEntity.setUserId(UserContext.getUserId());
            logEntity.setUsername(UserContext.getUsername());
            logEntity.setOperationModule(operationLog.module());
            logEntity.setOperationType(operationLog.type());
            logEntity.setOperationDesc(operationLog.description());

            if (request != null) {
                logEntity.setRequestMethod(request.getMethod());
                logEntity.setRequestUrl(request.getRequestURI());
                logEntity.setIpAddress(getIpAddress(request));
            }

            try {
                Object[] args = joinPoint.getArgs();
                if (args != null && args.length > 0) {
                    logEntity.setRequestParams(objectMapper.writeValueAsString(args));
                }
            } catch (Exception e) {
                logEntity.setRequestParams("参数序列化失败");
            }

            Object result = joinPoint.proceed();

            try {
                if (result != null) {
                    String resultStr = objectMapper.writeValueAsString(result);
                    logEntity.setResponseResult(resultStr.length() > 2000 ? resultStr.substring(0, 2000) : resultStr);
                }
            } catch (Exception e) {
                logEntity.setResponseResult("响应序列化失败");
            }

            long endTime = System.currentTimeMillis();
            logEntity.setExecuteTime(endTime - startTime);
            logEntity.setCreateTime(LocalDateTime.now());

            operationLogMapper.insert(logEntity);

            return result;
        } catch (Throwable e) {
            long endTime = System.currentTimeMillis();
            logEntity.setExecuteTime(endTime - startTime);
            logEntity.setResponseResult("异常: " + e.getMessage());
            logEntity.setCreateTime(LocalDateTime.now());
            operationLogMapper.insert(logEntity);
            throw e;
        }
    }

    private HttpServletRequest getRequest() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            return attributes != null ? attributes.getRequest() : null;
        } catch (Exception e) {
            return null;
        }
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
        return ip;
    }
}
