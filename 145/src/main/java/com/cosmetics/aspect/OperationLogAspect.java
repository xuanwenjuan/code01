package com.cosmetics.aspect;

import cn.hutool.core.util.StrUtil;
import cn.hutool.json.JSONUtil;
import com.cosmetics.annotation.OperationLog;
import com.cosmetics.context.UserContext;
import com.cosmetics.entity.OperationLog;
import com.cosmetics.mapper.OperationLogMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.lang.reflect.Method;

@Slf4j
@Aspect
@Component
@Order(1)
@RequiredArgsConstructor
public class OperationLogAspect {

    private final OperationLogMapper operationLogMapper;

    @Around("@annotation(com.cosmetics.annotation.OperationLog)")
    public Object around(ProceedingJoinPoint joinPoint) throws Throwable {
        long startTime = System.currentTimeMillis();

        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        OperationLog annotation = method.getAnnotation(OperationLog.class);

        HttpServletRequest request = getRequest();
        OperationLogEntity logEntity = new OperationLogEntity();
        logEntity.setModule(annotation.module());
        logEntity.setOperation(annotation.operation());
        logEntity.setMethod(request != null ? request.getMethod() : "");
        logEntity.setParams(getParams(joinPoint));
        logEntity.setIp(getIpAddr());
        logEntity.setUserId(UserContext.getUserId());
        logEntity.setUsername(UserContext.getUsername());

        Object result;
        try {
            result = joinPoint.proceed();
            logEntity.setStatus(1);
        } catch (Throwable e) {
            logEntity.setStatus(0);
            logEntity.setErrorMsg(e.getMessage());
            throw e;
        } finally {
            logEntity.setCostTime(System.currentTimeMillis() - startTime);
            saveLog(logEntity);
        }

        return result;
    }

    private String getParams(ProceedingJoinPoint joinPoint) {
        try {
            Object[] args = joinPoint.getArgs();
            if (args != null && args.length > 0) {
                return JSONUtil.toJsonStr(args);
            }
        } catch (Exception e) {
            log.warn("获取参数失败", e);
        }
        return "";
    }

    private String getIpAddr() {
        HttpServletRequest request = getRequest();
        if (request == null) {
            return "";
        }
        String ip = request.getHeader("X-Forwarded-For");
        if (StrUtil.isBlank(ip) || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (StrUtil.isBlank(ip) || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (StrUtil.isBlank(ip) || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_CLIENT_IP");
        }
        if (StrUtil.isBlank(ip) || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_X_FORWARDED_FOR");
        }
        if (StrUtil.isBlank(ip) || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return "0:0:0:0:0:0:0:1".equals(ip) ? "127.0.0.1" : ip;
    }

    private HttpServletRequest getRequest() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        return attributes != null ? attributes.getRequest() : null;
    }

    private void saveLog(OperationLogEntity logEntity) {
        try {
            OperationLog log = new OperationLog();
            log.setUserId(logEntity.getUserId());
            log.setUsername(logEntity.getUsername());
            log.setModule(logEntity.getModule());
            log.setOperation(logEntity.getOperation());
            log.setMethod(logEntity.getMethod());
            log.setParams(logEntity.getParams());
            log.setIp(logEntity.getIp());
            log.setCostTime(logEntity.getCostTime());
            log.setStatus(logEntity.getStatus());
            log.setErrorMsg(logEntity.getErrorMsg());
            operationLogMapper.insert(log);
        } catch (Exception e) {
            log.error("保存操作日志失败", e);
        }
    }

    @Data
    private static class OperationLogEntity {
        private Long userId;
        private String username;
        private String module;
        private String operation;
        private String method;
        private String params;
        private String ip;
        private Long costTime;
        private Integer status;
        private String errorMsg;
    }
}
