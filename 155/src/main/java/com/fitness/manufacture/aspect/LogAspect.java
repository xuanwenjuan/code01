package com.fitness.manufacture.aspect;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fitness.manufacture.annotation.Log;
import com.fitness.manufacture.common.UserContextHolder;
import com.fitness.manufacture.entity.OperationLog;
import com.fitness.manufacture.mapper.OperationLogMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.AfterThrowing;
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
public class LogAspect {

    private final OperationLogMapper operationLogMapper;
    private final ObjectMapper objectMapper;

    @Pointcut("@annotation(com.fitness.manufacture.annotation.Log)")
    public void logPointCut() {
    }

    @AfterReturning(pointcut = "logPointCut()", returning = "jsonResult")
    public void doAfterReturning(JoinPoint joinPoint, Object jsonResult) {
        handleLog(joinPoint, null, jsonResult);
    }

    @AfterThrowing(pointcut = "logPointCut()", throwing = "e")
    public void doAfterThrowing(JoinPoint joinPoint, Exception e) {
        handleLog(joinPoint, e, null);
    }

    private void handleLog(JoinPoint joinPoint, Exception e, Object jsonResult) {
        try {
            Log controllerLog = getAnnotationLog(joinPoint);
            if (controllerLog == null) {
                return;
            }

            OperationLog operationLog = new OperationLog();
            operationLog.setStatus(1);

            if (e != null) {
                operationLog.setStatus(0);
                operationLog.setErrorMsg(e.getMessage());
            }

            operationLog.setModule(controllerLog.module());
            operationLog.setOperation(controllerLog.operation());
            operationLog.setBusinessType(controllerLog.businessType());

            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                operationLog.setRequestMethod(request.getMethod());
                operationLog.setOperUrl(request.getRequestURI());
                operationLog.setOperIp(getIpAddr(request));
            }

            if (UserContextHolder.getUserContext() != null) {
                operationLog.setUserId(UserContextHolder.getUserContext().getUserId());
                operationLog.setUsername(UserContextHolder.getUserContext().getUsername());
            }

            operationLog.setMethod(joinPoint.getSignature().getName());
            operationLog.setOperParam(objectMapper.writeValueAsString(joinPoint.getArgs()));
            if (jsonResult != null) {
                operationLog.setJsonResult(objectMapper.writeValueAsString(jsonResult));
            }

            operationLog.setOperTime(LocalDateTime.now());
            operationLog.setCostTime(System.currentTimeMillis() - (Long) RequestContextHolder.getRequestAttributes().getAttribute("startTime", 0));

            operationLogMapper.insert(operationLog);
        } catch (Exception exp) {
            log.error("操作日志记录异常", exp);
        }
    }

    private Log getAnnotationLog(JoinPoint joinPoint) {
        try {
            return joinPoint.getTarget().getClass().getMethod(joinPoint.getSignature().getName(),
                    ((org.aspectj.lang.reflect.MethodSignature) joinPoint.getSignature()).getParameterTypes())
                    .getAnnotation(Log.class);
        } catch (Exception e) {
            return null;
        }
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
            ip = request.getHeader("HTTP_CLIENT_IP");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_X_FORWARDED_FOR");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return "0:0:0:0:0:0:0:1".equals(ip) ? "127.0.0.1" : ip.split(",")[0].trim();
    }
}
