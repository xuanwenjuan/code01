package com.sheetmetal.compressor.aspect;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sheetmetal.compressor.annotation.OperationLog;
import com.sheetmetal.compressor.context.UserContext;
import com.sheetmetal.compressor.entity.OperationLog;
import com.sheetmetal.compressor.mapper.OperationLogMapper;
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
import java.time.format.DateTimeFormatter;

@Slf4j
@Aspect
@Component
public class OperationLogAspect {

    @Autowired
    private OperationLogMapper operationLogMapper;

    @Autowired
    private ObjectMapper objectMapper;

    @Pointcut("@annotation(com.sheetmetal.compressor.annotation.OperationLog)")
    public void logPointCut() {
    }

    @Around("logPointCut() && @annotation(operationLog)")
    public Object around(ProceedingJoinPoint joinPoint, OperationLog operationLog) throws Throwable {
        long startTime = System.currentTimeMillis();
        Object result = null;

        try {
            result = joinPoint.proceed();
            return result;
        } finally {
            long costTime = System.currentTimeMillis() - startTime;
            saveLog(joinPoint, operationLog, result, costTime);
        }
    }

    private void saveLog(ProceedingJoinPoint joinPoint, OperationLog operationLog, Object result, long costTime) {
        try {
            OperationLog log = new OperationLog();

            String logNo = "LOG" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmssSSS"));
            log.setLogNo(logNo);
            log.setOperationModule(operationLog.module());
            log.setOperationType(operationLog.type());
            log.setOperationDesc(operationLog.desc());
            log.setOperatorId(UserContext.getUserId());
            log.setOperatorName(UserContext.getUsername());
            log.setOperatorRole(UserContext.getRole());
            log.setOperationTime(LocalDateTime.now());
            log.setCostTime(costTime);

            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                log.setIpAddress(getClientIP(request));
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
                }
            } catch (Exception e) {
                log.setResponseResult("响应序列化失败");
            }

            operationLogMapper.insert(log);
        } catch (Exception e) {
            log.error("保存操作日志失败", e);
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
