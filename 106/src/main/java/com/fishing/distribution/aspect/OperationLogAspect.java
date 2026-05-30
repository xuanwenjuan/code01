package com.fishing.distribution.aspect;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fishing.distribution.annotation.OperationLogger;
import com.fishing.distribution.common.Constants;
import com.fishing.distribution.entity.OperationLog;
import com.fishing.distribution.mapper.OperationLogMapper;
import com.fishing.distribution.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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
    private final JwtUtil jwtUtil;

    @Pointcut("@annotation(com.fishing.distribution.annotation.OperationLogger)")
    public void operationLogPointcut() {
    }

    @Around("operationLogPointcut()")
    public Object around(ProceedingJoinPoint joinPoint) throws Throwable {
        long startTime = System.currentTimeMillis();
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        OperationLogger operationLogger = signature.getMethod().getAnnotation(OperationLogger.class);

        OperationLog operationLog = new OperationLog();
        operationLog.setOperationModule(operationLogger.module());
        operationLog.setOperationType(operationLogger.type());
        operationLog.setOperationDesc(operationLogger.desc());
        operationLog.setOperationTime(LocalDateTime.now());

        try {
            HttpServletRequest request = getRequest();
            if (request != null) {
                operationLog.setIpAddress(getClientIp(request));
                String token = request.getHeader("Authorization");
                if (token != null && token.startsWith("Bearer ")) {
                    token = token.substring(7);
                    try {
                        Long userId = jwtUtil.getUserIdFromToken(token);
                        String username = jwtUtil.getUsernameFromToken(token);
                        operationLog.setOperatorId(userId);
                        operationLog.setOperatorName(username);
                    } catch (Exception e) {
                        log.warn("解析Token获取用户信息失败", e);
                    }
                }
            }

            if (operationLogger.saveRequest()) {
                Object[] args = joinPoint.getArgs();
                if (args != null && args.length > 0) {
                    try {
                        String params = objectMapper.writeValueAsString(args);
                        if (params.length() > 4000) {
                            params = params.substring(0, 4000) + "...";
                        }
                        operationLog.setRequestParams(params);
                    } catch (Exception e) {
                        log.warn("序列化请求参数失败", e);
                    }
                }
            }

            Object result = joinPoint.proceed();

            if (operationLogger.saveResponse()) {
                try {
                    String response = objectMapper.writeValueAsString(result);
                    if (response.length() > 4000) {
                        response = response.substring(0, 4000) + "...";
                    }
                    operationLog.setResponseResult(response);
                } catch (Exception e) {
                    log.warn("序列化响应结果失败", e);
                }
            }

            operationLog.setStatus(Constants.LOG_STATUS_SUCCESS);
            return result;

        } catch (Throwable e) {
            operationLog.setStatus(Constants.LOG_STATUS_FAIL);
            operationLog.setErrorMsg(e.getMessage() != null ? e.getMessage().substring(0, Math.min(e.getMessage().length(), 500)) : null);
            throw e;
        } finally {
            long costTime = System.currentTimeMillis() - startTime;
            operationLog.setCostTime(costTime);
            try {
                operationLogMapper.insert(operationLog);
            } catch (Exception e) {
                log.error("保存操作日志失败", e);
            }
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
            ip = request.getHeader("X-Real-IP");
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
