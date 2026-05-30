package com.heritage.dye.aspect;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.heritage.dye.annotation.OperationLog;
import com.heritage.dye.context.UserContext;
import com.heritage.dye.mapper.OperationLogMapper;
import com.heritage.dye.po.OperationLogPO;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;

@Slf4j
@Aspect
@Component
public class OperationLogAspect {

    @Autowired
    private OperationLogMapper operationLogMapper;

    @Autowired
    private ObjectMapper objectMapper;

    @Around("@annotation(operationLog)")
    public Object around(ProceedingJoinPoint joinPoint, OperationLog operationLog) throws Throwable {
        long startTime = System.currentTimeMillis();
        OperationLogPO logPO = new OperationLogPO();
        logPO.setCreateTime(LocalDateTime.now());

        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                logPO.setIp(getIpAddr(request));
                logPO.setMethod(request.getMethod());
            }

            logPO.setUserId(UserContext.getUserId());
            logPO.setUsername(UserContext.getUsername());
            logPO.setModule(operationLog.module());
            logPO.setOperation(operationLog.operation());

            Object[] args = joinPoint.getArgs();
            if (args != null && args.length > 0) {
                try {
                    logPO.setParams(objectMapper.writeValueAsString(args));
                } catch (Exception e) {
                    logPO.setParams("参数序列化失败");
                }
            }

            Object result = joinPoint.proceed();

            logPO.setStatus(1);
            logPO.setDuration(System.currentTimeMillis() - startTime);
            operationLogMapper.insert(logPO);

            return result;
        } catch (Throwable e) {
            logPO.setStatus(0);
            logPO.setErrorMsg(e.getMessage());
            logPO.setDuration(System.currentTimeMillis() - startTime);
            try {
                operationLogMapper.insert(logPO);
            } catch (Exception ex) {
                log.error("保存操作日志失败", ex);
            }
            throw e;
        }
    }

    private String getIpAddr(HttpServletRequest request) {
        String ip = request.getHeader("x-forwarded-for");
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
}
