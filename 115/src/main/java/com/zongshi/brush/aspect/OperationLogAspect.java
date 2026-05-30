package com.zongshi.brush.aspect;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zongshi.brush.annotation.OperationLog;
import com.zongshi.brush.entity.OperationLog;
import com.zongshi.brush.mapper.OperationLogMapper;
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

import java.lang.reflect.Method;
import java.time.LocalDateTime;

@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class OperationLogAspect {

    private final OperationLogMapper operationLogMapper;
    private final ObjectMapper objectMapper;

    @Around("@annotation(com.zongshi.brush.annotation.OperationLog)")
    public Object around(ProceedingJoinPoint joinPoint) throws Throwable {
        long startTime = System.currentTimeMillis();
        LocalDateTime operationTime = LocalDateTime.now();

        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        OperationLog operationLog = method.getAnnotation(OperationLog.class);

        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        HttpServletRequest request = attributes != null ? attributes.getRequest() : null;

        Object result = null;
        String errorMsg = null;
        try {
            result = joinPoint.proceed();
            return result;
        } catch (Throwable e) {
            errorMsg = e.getMessage();
            throw e;
        } finally {
            try {
                long costTime = System.currentTimeMillis() - startTime;

                OperationLog log = new OperationLog();
                log.setModuleName(operationLog.module());
                log.setOperationType(operationLog.type());
                log.setOperationDesc(operationLog.description());
                log.setOperationTime(operationTime);
                log.setCostTime(costTime);

                if (request != null) {
                    log.setRequestMethod(request.getMethod());
                    log.setRequestUrl(request.getRequestURI());
                    log.setIpAddress(getIpAddress(request));
                }

                try {
                    Object[] args = joinPoint.getArgs();
                    if (args != null && args.length > 0) {
                        log.setRequestParams(objectMapper.writeValueAsString(args));
                    }
                } catch (Exception e) {
                    log.setRequestParams("参数序列化失败");
                }

                try {
                    if (result != null) {
                        log.setResponseResult(objectMapper.writeValueAsString(result));
                    } else if (errorMsg != null) {
                        log.setResponseResult("操作失败：" + errorMsg);
                    }
                } catch (Exception e) {
                    log.setResponseResult("响应序列化失败");
                }

                log.setUserId(1L);
                log.setUserName("admin");

                operationLogMapper.insert(log);
            } catch (Exception e) {
                log.error("记录操作日志失败", e);
            }
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
