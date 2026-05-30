package com.motor.core.aspect;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.motor.core.annotation.OperationLog;
import com.motor.core.entity.po.OperationLogPO;
import com.motor.core.mapper.OperationLogMapper;
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
import java.time.LocalDateTime;

@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class OperationLogAspect {
    private final OperationLogMapper operationLogMapper;
    private final ObjectMapper objectMapper;

    @Pointcut("@annotation(com.motor.core.annotation.OperationLog)")
    public void logPointcut() {
    }

    @Around("logPointcut()")
    public Object around(ProceedingJoinPoint joinPoint) throws Throwable {
        long start = System.currentTimeMillis();
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        OperationLog logAnnotation = method.getAnnotation(OperationLog.class);

        OperationLogPO logPO = new OperationLogPO();
        logPO.setCreateTime(LocalDateTime.now());

        if (logAnnotation != null) {
            logPO.setModule(logAnnotation.module());
            logPO.setOperation(logAnnotation.operation());
            logPO.setDescription(logAnnotation.description());
        }

        HttpServletRequest request = getRequest();
        if (request != null) {
            logPO.setIp(getClientIP(request));
            logPO.setRequestUrl(request.getRequestURI());
            logPO.setRequestMethod(request.getMethod());

            Object userId = request.getAttribute("userId");
            Object userName = request.getAttribute("userName");
            if (userId != null) {
                logPO.setOperatorId(Long.valueOf(userId.toString()));
            }
            if (userName != null) {
                logPO.setOperatorName(userName.toString());
            }
        }

        if (logAnnotation != null && logAnnotation.saveRequest()) {
            try {
                Object[] args = joinPoint.getArgs();
                if (args != null && args.length > 0) {
                    StringBuilder params = new StringBuilder();
                    for (Object arg : args) {
                        if (arg != null && !isServletObject(arg)) {
                            params.append(objectMapper.writeValueAsString(arg)).append(";");
                        }
                    }
                    logPO.setRequestParams(params.toString());
                }
            } catch (Exception e) {
                log.warn("保存请求参数失败", e);
            }
        }

        Object result = null;
        try {
            result = joinPoint.proceed();
            logPO.setSuccess(1);

            if (logAnnotation != null && logAnnotation.saveResponse()) {
                try {
                    logPO.setResponseResult(objectMapper.writeValueAsString(result));
                } catch (Exception e) {
                    log.warn("保存响应结果失败", e);
                }
            }
        } catch (Throwable e) {
            logPO.setSuccess(0);
            logPO.setErrorMessage(e.getMessage());
            throw e;
        } finally {
            logPO.setCostTime((int) (System.currentTimeMillis() - start));
            try {
                operationLogMapper.insert(logPO);
            } catch (Exception e) {
                log.error("保存操作日志失败", e);
            }
        }

        return result;
    }

    private HttpServletRequest getRequest() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            return attributes != null ? attributes.getRequest() : null;
        } catch (Exception e) {
            return null;
        }
    }

    private String getClientIP(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }

    private boolean isServletObject(Object obj) {
        return obj instanceof HttpServletRequest ||
               obj instanceof jakarta.servlet.http.HttpServletResponse ||
               obj instanceof jakarta.servlet.http.HttpSession;
    }
}
