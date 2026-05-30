package com.radiator.management.aspect;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.radiator.management.annotation.OpLog;
import com.radiator.management.entity.OperationLog;
import com.radiator.management.mapper.OperationLogMapper;
import com.radiator.management.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class OperationLogAspect {

    private final OperationLogMapper operationLogMapper;
    private final JwtUtil jwtUtil;
    private final ObjectMapper objectMapper;

    @Around("@annotation(opLog)")
    public Object around(ProceedingJoinPoint joinPoint, OpLog opLog) throws Throwable {
        long beginTime = System.currentTimeMillis();
        Object result = joinPoint.proceed();
        long time = System.currentTimeMillis() - beginTime;

        try {
            saveLog(joinPoint, opLog, result, time);
        } catch (Exception e) {
            log.error("保存操作日志失败", e);
        }
        return result;
    }

    private void saveLog(ProceedingJoinPoint joinPoint, OpLog opLog, Object result, long time) {
        OperationLog log = new OperationLog();
        log.setModule(opLog.module());
        log.setOperation(opLog.operation());

        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            log.setIp(getIpAddr(request));
            
            String token = request.getHeader("Authorization");
            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring(7);
                try {
                    log.setUserId(jwtUtil.getUserIdFromToken(token));
                    log.setUsername(jwtUtil.getUsernameFromToken(token));
                } catch (Exception ignored) {}
            }
        }

        try {
            Object[] args = joinPoint.getArgs();
            if (args != null && args.length > 0) {
                log.setParams(objectMapper.writeValueAsString(args));
            }
            log.setResult(objectMapper.writeValueAsString(result));
        } catch (Exception ignored) {}

        operationLogMapper.insert(log);
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
        return "0:0:0:0:0:0:0:1".equals(ip) ? "127.0.0.1" : ip;
    }
}