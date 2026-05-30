package com.spindle.manage.aspect;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.spindle.manage.annotation.OperationLogger;
import com.spindle.manage.entity.OperationLog;
import com.spindle.manage.mapper.OperationLogMapper;
import com.spindle.manage.utils.UserContext;
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

@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class OperationLogAspect {

    private final OperationLogMapper operationLogMapper;
    private final ObjectMapper objectMapper;

    @Pointcut("@annotation(com.spindle.manage.annotation.OperationLogger)")
    public void logPointcut() {
    }

    @Around("logPointcut()")
    public Object around(ProceedingJoinPoint joinPoint) throws Throwable {
        long startTime = System.currentTimeMillis();

        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        OperationLogger operationLogger = signature.getMethod().getAnnotation(OperationLogger.class);

        String operation = operationLogger.value();
        String operationType = operationLogger.operationType();
        String businessType = operationLogger.businessType();
        String method = signature.getDeclaringTypeName() + "." + signature.getName();

        Object[] args = joinPoint.getArgs();
        String params = "";
        try {
            params = objectMapper.writeValueAsString(args);
            if (params.length() > 2000) {
                params = params.substring(0, 2000) + "...";
            }
        } catch (Exception e) {
            log.warn("参数序列化失败", e);
        }

        String ip = getClientIp();

        Object result = null;
        int status = 1;
        String errorMsg = null;
        String resultStr = null;

        try {
            result = joinPoint.proceed();
            try {
                if (result != null) {
                    resultStr = objectMapper.writeValueAsString(result);
                    if (resultStr.length() > 2000) {
                        resultStr = resultStr.substring(0, 2000) + "...";
                    }
                }
            } catch (Exception e) {
                log.warn("结果序列化失败", e);
            }
        } catch (Throwable e) {
            status = 0;
            errorMsg = e.getMessage();
            if (errorMsg != null && errorMsg.length() > 500) {
                errorMsg = errorMsg.substring(0, 500);
            }
            throw e;
        } finally {
            long costTime = System.currentTimeMillis() - startTime;
            saveOperationLog(operation, operationType, businessType, method, params, resultStr, ip, costTime, status, errorMsg);
        }

        return result;
    }

    private void saveOperationLog(String operation, String operationType, String businessType,
                                  String method, String params, String result, String ip,
                                  long costTime, int status, String errorMsg) {
        try {
            OperationLog operationLog = new OperationLog();
            operationLog.setUserId(UserContext.getUserId());
            operationLog.setUsername(UserContext.getUsername());
            operationLog.setOperation(operation);
            operationLog.setOperationType(operationType);
            operationLog.setBusinessType(businessType);
            operationLog.setMethod(method);
            operationLog.setParams(params);
            operationLog.setResult(result);
            operationLog.setIp(ip);
            operationLog.setOperationTime(LocalDateTime.now());
            operationLog.setCostTime(costTime);
            operationLog.setStatus(status);
            operationLog.setErrorMsg(errorMsg);
            operationLogMapper.insert(operationLog);
        } catch (Exception e) {
            log.error("保存操作日志失败", e);
        }
    }

    private String getClientIp() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
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
        } catch (Exception e) {
            log.warn("获取IP地址失败", e);
        }
        return "unknown";
    }

}
