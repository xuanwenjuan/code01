package com.aromatherapy.aspect;

import com.aromatherapy.annotation.OperationLog;
import com.aromatherapy.entity.po.OperationLogPO;
import com.aromatherapy.mapper.OperationLogMapper;
import com.aromatherapy.util.JwtUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
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
    private final JwtUtil jwtUtil;

    @Around("@annotation(operationLog)")
    public Object around(ProceedingJoinPoint joinPoint, OperationLog operationLog) throws Throwable {
        long startTime = System.currentTimeMillis();
        OperationLogPO log = new OperationLogPO();

        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            HttpServletRequest request = attributes.getRequest();

            log.setOperationModule(operationLog.module());
            log.setOperationType(operationLog.type());
            log.setOperationDesc(operationLog.desc());
            log.setRequestMethod(request.getMethod());
            log.setRequestUrl(request.getRequestURI());
            log.setIpAddress(getIpAddress(request));

            String token = request.getHeader("Authorization");
            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring(7);
                try {
                    Long userId = jwtUtil.getUserIdFromToken(token);
                    String username = jwtUtil.getUsernameFromToken(token);
                    log.setOperationUserId(userId);
                    log.setOperationUsername(username);
                } catch (Exception e) {
                    log.warn("解析token失败", e);
                }
            }

            MethodSignature signature = (MethodSignature) joinPoint.getSignature();
            String[] paramNames = signature.getParameterNames();
            Object[] paramValues = joinPoint.getArgs();
            if (paramNames != null && paramValues != null) {
                StringBuilder params = new StringBuilder();
                for (int i = 0; i < paramNames.length; i++) {
                    params.append(paramNames[i]).append("=").append(paramValues[i]).append("; ");
                }
                log.setRequestParam(params.toString());
            }

            Object result = joinPoint.proceed();

            long costTime = System.currentTimeMillis() - startTime;
            log.setCostTime(costTime);
            log.setStatus(1);
            log.setResponseResult(objectMapper.writeValueAsString(result));
            log.setCreateTime(LocalDateTime.now());
            operationLogMapper.insert(log);

            return result;

        } catch (Throwable e) {
            long costTime = System.currentTimeMillis() - startTime;
            log.setCostTime(costTime);
            log.setStatus(0);
            log.setErrorMsg(e.getMessage());
            log.setCreateTime(LocalDateTime.now());
            operationLogMapper.insert(log);
            throw e;
        }
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
            ip = request.getRemoteAddr();
        }
        return ip;
    }
}
