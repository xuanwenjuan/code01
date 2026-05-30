package com.hardware.stamping.aspect;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hardware.stamping.annotation.Log;
import com.hardware.stamping.entity.OperationLog;
import com.hardware.stamping.mapper.OperationLogMapper;
import com.hardware.stamping.util.UserContext;
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
public class LogAspect {

    @Autowired
    private OperationLogMapper operationLogMapper;

    @Autowired
    private ObjectMapper objectMapper;

    @Pointcut("@annotation(com.hardware.stamping.annotation.Log)")
    public void logPointcut() {
    }

    @Around("@annotation(logAnnotation)")
    public Object around(ProceedingJoinPoint joinPoint, Log logAnnotation) throws Throwable {
        long startTime = System.currentTimeMillis();

        OperationLog operationLog = new OperationLog();
        operationLog.setUserId(UserContext.getUserId());
        operationLog.setUsername(UserContext.getUsername());
        operationLog.setOperation(logAnnotation.value());
        operationLog.setMethod(joinPoint.getSignature().getName());
        operationLog.setCreateTime(LocalDateTime.now());

        try {
            Object[] args = joinPoint.getArgs();
            if (args != null && args.length > 0) {
                operationLog.setParams(objectMapper.writeValueAsString(args));
            }
        } catch (Exception e) {
            log.error("序列化参数失败", e);
        }

        HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest();
        operationLog.setIp(getIpAddr(request));

        Object result = null;
        try {
            result = joinPoint.proceed();
            operationLog.setResult("成功");
        } catch (Throwable e) {
            operationLog.setResult("失败：" + e.getMessage());
            throw e;
        } finally {
            long duration = System.currentTimeMillis() - startTime;
            operationLog.setDuration(duration);
            operationLogMapper.insert(operationLog);
        }

        return result;
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
            ip = request.getRemoteAddr();
        }
        return ip;
    }
}
