package com.gear.mfg.aspect;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gear.mfg.annotation.OperationLog;
import com.gear.mfg.context.UserContext;
import com.gear.mfg.entity.OperationLogEntity;
import com.gear.mfg.mapper.OperationLogMapper;
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

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Aspect
@Component
@Slf4j
@RequiredArgsConstructor
public class OperationLogAspect {

    private final OperationLogMapper operationLogMapper;
    private final ObjectMapper objectMapper;

    @Pointcut("@annotation(com.gear.mfg.annotation.OperationLog)")
    public void operationLogPointcut() {
    }

    @Around("operationLogPointcut()")
    public Object around(ProceedingJoinPoint joinPoint) throws Throwable {
        long startTime = System.currentTimeMillis();

        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        OperationLog operationLog = signature.getMethod().getAnnotation(OperationLog.class);

        OperationLogEntity logEntity = new OperationLogEntity();
        logEntity.setModule(operationLog.module());
        logEntity.setOperation(operationLog.operation());
        logEntity.setDescription(operationLog.description());
        logEntity.setMethod(signature.getDeclaringTypeName() + "." + signature.getName());

        String[] paramNames = signature.getParameterNames();
        Object[] paramValues = joinPoint.getArgs();
        Map<String, Object> params = new HashMap<>();
        for (int i = 0; i < paramNames.length; i++) {
            params.put(paramNames[i], paramValues[i]);
        }
        try {
            logEntity.setParams(objectMapper.writeValueAsString(params));
        } catch (Exception e) {
            log.warn("序列化参数失败", e);
            logEntity.setParams("参数序列化失败");
        }

        HttpServletRequest request = getRequest();
        if (request != null) {
            logEntity.setIp(getClientIP(request));
            logEntity.setUrl(request.getRequestURI());
            logEntity.setHttpMethod(request.getMethod());
        }

        Long userId = UserContext.getUserId();
        String username = UserContext.getUsername();
        if (userId != null) {
            logEntity.setUserId(userId);
        }
        if (username != null) {
            logEntity.setUsername(username);
        }

        logEntity.setStartTime(LocalDateTime.now());
        Object result = null;

        try {
            result = joinPoint.proceed();
            logEntity.setStatus(1);

            try {
                if (result != null) {
                    String resultStr = objectMapper.writeValueAsString(result);
                    if (resultStr.length() > 2000) {
                        resultStr = resultStr.substring(0, 2000) + "...";
                    }
                    logEntity.setResult(resultStr);
                }
            } catch (Exception e) {
                log.warn("序列化返回结果失败", e);
                logEntity.setResult("结果序列化失败");
            }

        } catch (Throwable e) {
            logEntity.setStatus(0);
            logEntity.setErrorMessage(e.getMessage());
            throw e;
        } finally {
            long costTime = System.currentTimeMillis() - startTime;
            logEntity.setCostTime(costTime);
            logEntity.setEndTime(LocalDateTime.now());

            try {
                operationLogMapper.insert(logEntity);
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
