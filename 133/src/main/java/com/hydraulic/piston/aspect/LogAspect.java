package com.hydraulic.piston.aspect;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hydraulic.piston.annotation.Log;
import com.hydraulic.piston.entity.OperationLog;
import com.hydraulic.piston.mapper.OperationLogMapper;
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

    @Pointcut("@annotation(com.hydraulic.piston.annotation.Log)")
    public void logPointCut() {
    }

    @Around("logPointCut()")
    public Object around(ProceedingJoinPoint joinPoint) throws Throwable {
        long beginTime = System.currentTimeMillis();

        Object result = null;
        Exception exception = null;
        try {
            result = joinPoint.proceed();
        } catch (Exception e) {
            exception = e;
            throw e;
        } finally {
            long executionTime = System.currentTimeMillis() - beginTime;
            saveLog(joinPoint, exception, executionTime);
        }

        return result;
    }

    private void saveLog(ProceedingJoinPoint joinPoint, Exception exception, long executionTime) {
        try {
            MethodSignature signature = (MethodSignature) joinPoint.getSignature();
            Method method = signature.getMethod();

            OperationLog operationLog = new OperationLog();

            Log logAnnotation = method.getAnnotation(Log.class);
            if (logAnnotation != null) {
                operationLog.setModule(logAnnotation.module());
                operationLog.setOperation(logAnnotation.operation());
            }

            String className = joinPoint.getTarget().getClass().getName();
            String methodName = signature.getName();
            operationLog.setMethod(className + "." + methodName + "()");

            Object[] args = joinPoint.getArgs();
            try {
                String params = objectMapper.writeValueAsString(args);
                if (params.length() > 2000) {
                    params = params.substring(0, 2000) + "...";
                }
                operationLog.setParams(params);
            } catch (Exception e) {
                operationLog.setParams("参数序列化失败");
            }

            HttpServletRequest request = getRequest();
            if (request != null) {
                operationLog.setIp(getIpAddr(request));
                String userIdStr = (String) request.getAttribute("userId");
                if (userIdStr != null) {
                    operationLog.setUserId(Long.parseLong(userIdStr));
                }
            }

            if (exception != null) {
                operationLog.setStatus(0);
                String errorMsg = exception.getMessage();
                if (errorMsg != null && errorMsg.length() > 2000) {
                    errorMsg = errorMsg.substring(0, 2000) + "...";
                }
                operationLog.setErrorMsg(errorMsg);
            } else {
                operationLog.setStatus(1);
            }

            operationLog.setExecutionTime(executionTime);
            operationLogMapper.insert(operationLog);

        } catch (Exception e) {
            log.error("保存操作日志失败", e);
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

    private String getIpAddr(HttpServletRequest request) {
        String ip = request.getHeader("X-Real-IP");
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Forwarded-For");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return "0:0:0:0:0:0:0:1".equals(ip) ? "127.0.0.1" : ip;
    }
}
