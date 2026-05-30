package com.amber.polish.aspect;

import com.amber.polish.annotation.OperationLog;
import com.amber.polish.entity.OperationLog;
import com.amber.polish.mapper.OperationLogMapper;
import com.amber.polish.util.JwtUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
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
    private final JwtUtil jwtUtil;
    private final ObjectMapper objectMapper;

    @Pointcut("@annotation(com.amber.polish.annotation.OperationLog)")
    public void logPointcut() {
    }

    @Around("logPointcut() && @annotation(operationLog)")
    public Object around(ProceedingJoinPoint joinPoint, OperationLog operationLog) throws Throwable {
        long startTime = System.currentTimeMillis();
        OperationLog logEntity = new OperationLog();

        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                String token = request.getHeader("Authorization");
                if (token != null && token.startsWith("Bearer ")) {
                    token = token.substring(7);
                    if (jwtUtil.validateToken(token)) {
                        Long userId = jwtUtil.getUserIdFromToken(token);
                        String username = jwtUtil.getUsernameFromToken(token);
                        logEntity.setUserId(userId);
                        logEntity.setUsername(username);
                    }
                }

                logEntity.setRequestMethod(request.getMethod());
                logEntity.setRequestUrl(request.getRequestURI());
                logEntity.setIpAddress(getIpAddress(request));
            }

            MethodSignature signature = (MethodSignature) joinPoint.getSignature();
            logEntity.setOperationModule(operationLog.module());
            logEntity.setOperationType(operationLog.type());
            logEntity.setOperationDesc(operationLog.description());

            Object[] args = joinPoint.getArgs();
            String[] parameterNames = signature.getParameterNames();
            if (args != null && args.length > 0) {
                StringBuilder params = new StringBuilder();
                for (int i = 0; i < args.length; i++) {
                    if (args[i] != null && !isHttpObject(args[i])) {
                        params.append(parameterNames[i]).append("=");
                        try {
                            params.append(objectMapper.writeValueAsString(args[i]));
                        } catch (Exception e) {
                            params.append(args[i].toString());
                        }
                        params.append(", ");
                    }
                }
                if (params.length() > 0) {
                    logEntity.setRequestParams(params.substring(0, params.length() - 2));
                }
            }

            logEntity.setCreateTime(LocalDateTime.now());

            Object result = joinPoint.proceed();

            long executionTime = System.currentTimeMillis() - startTime;
            logEntity.setExecutionTime(executionTime);
            logEntity.setStatus(1);

            try {
                logEntity.setResponseResult(objectMapper.writeValueAsString(result));
            } catch (Exception e) {
                logEntity.setResponseResult(result.toString());
            }

            return result;

        } catch (Exception e) {
            logEntity.setStatus(0);
            logEntity.setErrorMsg(e.getMessage());
            throw e;

        } finally {
            try {
                operationLogMapper.insert(logEntity);
            } catch (Exception e) {
                log.error("保存操作日志异常", e);
            }
        }
    }

    private boolean isHttpObject(Object obj) {
        return obj instanceof jakarta.servlet.http.HttpServletRequest
                || obj instanceof jakarta.servlet.http.HttpServletResponse;
    }

    private String getIpAddress(HttpServletRequest request) {
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
