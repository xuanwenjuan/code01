package com.firecontrol.aspect;

import cn.hutool.core.util.StrUtil;
import cn.hutool.json.JSONUtil;
import com.firecontrol.annotation.OperationLog;
import com.firecontrol.entity.OperationLogEntity;
import com.firecontrol.mapper.OperationLogMapper;
import com.firecontrol.utils.UserContextUtil;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.lang.reflect.Method;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Aspect
@Component
public class OperationLogAspect {

    @Resource
    private OperationLogMapper operationLogMapper;

    @Around("@annotation(com.firecontrol.annotation.OperationLog)")
    public Object around(ProceedingJoinPoint joinPoint) throws Throwable {
        LocalDateTime startTime = LocalDateTime.now();
        long startMs = System.currentTimeMillis();

        OperationLogEntity logEntity = new OperationLogEntity();
        logEntity.setStartTime(startTime);
        logEntity.setStatus(1);

        try {
            MethodSignature signature = (MethodSignature) joinPoint.getSignature();
            Method method = signature.getMethod();
            OperationLog operationLog = method.getAnnotation(OperationLog.class);

            if (operationLog != null) {
                logEntity.setModule(operationLog.module());
                logEntity.setOperation(operationLog.operation());
                logEntity.setDescription(operationLog.description());
            }

            logEntity.setMethod(method.getName());
            logEntity.setParams(buildParams(joinPoint, signature));
            logEntity.setUserId(UserContextUtil.getUserId());
            logEntity.setUsername(UserContextUtil.getUsername());
            logEntity.setIpAddress(getIpAddress());

            Object result = joinPoint.proceed();

            logEntity.setResult(JSONUtil.toJsonStr(result));

            return result;
        } catch (Throwable e) {
            logEntity.setStatus(0);
            logEntity.setErrorMsg(e.getMessage());
            throw e;
        } finally {
            LocalDateTime endTime = LocalDateTime.now();
            logEntity.setEndTime(endTime);
            logEntity.setCostTime(System.currentTimeMillis() - startMs);
            try {
                operationLogMapper.insert(logEntity);
            } catch (Exception e) {
                log.error("保存操作日志失败: {}", e.getMessage());
            }
        }
    }

    private String buildParams(ProceedingJoinPoint joinPoint, MethodSignature signature) {
        try {
            String[] parameterNames = signature.getParameterNames();
            Object[] args = joinPoint.getArgs();
            Map<String, Object> params = new HashMap<>();

            for (int i = 0; i < parameterNames.length; i++) {
                if (args[i] instanceof HttpServletRequest || args[i] instanceof javax.servlet.http.HttpServletResponse) {
                    continue;
                }
                params.put(parameterNames[i], args[i]);
            }

            return JSONUtil.toJsonStr(params);
        } catch (Exception e) {
            return "";
        }
    }

    private String getIpAddress() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
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
                return ip;
            }
        } catch (Exception e) {
            log.error("获取IP地址失败: {}", e.getMessage());
        }
        return "";
    }
}
