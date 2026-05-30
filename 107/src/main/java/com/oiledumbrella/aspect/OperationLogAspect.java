package com.oiledumbrella.aspect;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.oiledumbrella.annotation.OperationLog;
import com.oiledumbrella.entity.SysUser;
import com.oiledumbrella.service.OperationLogService;
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

import java.lang.reflect.Method;

@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class OperationLogAspect {

    private final OperationLogService operationLogService;
    private final ObjectMapper objectMapper;

    @Around("@annotation(com.oiledumbrella.annotation.OperationLog)")
    public Object around(ProceedingJoinPoint joinPoint) throws Throwable {
        long startTime = System.currentTimeMillis();
        
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        OperationLog annotation = method.getAnnotation(OperationLog.class);
        
        com.oiledumbrella.entity.OperationLog operationLog = new com.oiledumbrella.entity.OperationLog();
        operationLog.setOperationType(annotation.operationType());
        operationLog.setBusinessType(annotation.businessType());
        operationLog.setDescription(annotation.description());
        
        try {
            HttpServletRequest request = getRequest();
            if (request != null) {
                operationLog.setIpAddress(getIpAddr(request));
                Long userId = (Long) request.getAttribute("userId");
                String username = (String) request.getAttribute("username");
                if (userId != null) {
                    operationLog.setUserId(userId);
                    operationLog.setUserName(username);
                }
            }
            
            Object[] args = joinPoint.getArgs();
            if (args != null && args.length > 0) {
                try {
                    operationLog.setRequestParams(objectMapper.writeValueAsString(args));
                } catch (Exception e) {
                    operationLog.setRequestParams("参数序列化失败");
                }
            }
        } catch (Exception e) {
            log.error("获取请求信息失败", e);
        }
        
        Object result = null;
        try {
            result = joinPoint.proceed();
            operationLog.setStatus(1);
            try {
                if (result != null) {
                    operationLog.setResponseResult(objectMapper.writeValueAsString(result));
                }
            } catch (Exception e) {
                operationLog.setResponseResult("响应序列化失败");
            }
        } catch (Throwable e) {
            operationLog.setStatus(0);
            operationLog.setErrorMsg(e.getMessage());
            throw e;
        } finally {
            try {
                operationLogService.saveLog(operationLog);
            } catch (Exception e) {
                log.error("保存操作日志异步失败", e);
            }
        }
        
        return result;
    }

    private HttpServletRequest getRequest() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        return attributes != null ? attributes.getRequest() : null;
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
            ip = request.getHeader("HTTP_CLIENT_IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_X_FORWARDED_FOR");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }
}
