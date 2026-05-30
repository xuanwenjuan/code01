package com.bearing.production.aspect;

import com.bearing.production.annotation.OperationLog;
import com.bearing.production.context.UserContext;
import com.bearing.production.entity.OperationLogEntity;
import com.bearing.production.mapper.OperationLogMapper;
import com.fasterxml.jackson.databind.ObjectMapper;
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

import java.lang.reflect.Method;
import java.util.Arrays;

@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class OperationLogAspect {

    private final OperationLogMapper operationLogMapper;
    private final ObjectMapper objectMapper;

    @Pointcut("@annotation(com.bearing.production.annotation.OperationLog)")
    public void operationLogPointcut() {
    }

    @Around("operationLogPointcut()")
    public Object around(ProceedingJoinPoint joinPoint) throws Throwable {
        long startTime = System.currentTimeMillis();

        Method method = getMethod(joinPoint);
        OperationLog operationLog = method.getAnnotation(OperationLog.class);

        OperationLogEntity logEntity = new OperationLogEntity();
        logEntity.setModule(operationLog.module());
        logEntity.setDescription(operationLog.description());
        logEntity.setMethod(joinPoint.getSignature().toShortString());

        try {
            logEntity.setParams(objectMapper.writeValueAsString(Arrays.toString(joinPoint.getArgs())));
        } catch (Exception e) {
            logEntity.setParams("参数序列化失败");
        }

        HttpServletRequest request = getRequest();
        if (request != null) {
            logEntity.setIp(getClientIp(request));
        }

        logEntity.setUserId(UserContext.getUserId());
        logEntity.setUsername(UserContext.getUsername());

        Object result = null;
        try {
            result = joinPoint.proceed();
            return result;
        } finally {
            long duration = System.currentTimeMillis() - startTime;
            logEntity.setDuration(duration);
            operationLogMapper.insert(logEntity);
        }
    }

    private Method getMethod(ProceedingJoinPoint joinPoint) {
        String methodName = joinPoint.getSignature().getName();
        Class<?>[] parameterTypes = Arrays.stream(joinPoint.getArgs())
                .map(Object::getClass)
                .toArray(Class<?>[]::new);
        try {
            return joinPoint.getTarget().getClass().getMethod(methodName, parameterTypes);
        } catch (NoSuchMethodException e) {
            throw new RuntimeException("获取方法失败", e);
        }
    }

    private HttpServletRequest getRequest() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        return attributes != null ? attributes.getRequest() : null;
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }
}
