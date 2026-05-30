package com.stationery.manufacture.aspect;

import com.alibaba.fastjson2.JSON;
import com.stationery.manufacture.common.OperLog;
import com.stationery.manufacture.common.UserContext;
import com.stationery.manufacture.entity.OperationLog;
import com.stationery.manufacture.mapper.OperationLogMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.multipart.MultipartFile;

import java.lang.reflect.Method;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.stream.Collectors;

@Slf4j
@Aspect
@Component
public class OperationLogAspect {

    private final OperationLogMapper logMapper;

    public OperationLogAspect(OperationLogMapper logMapper) {
        this.logMapper = logMapper;
    }

    @Around("@annotation(com.stationery.manufacture.common.OperLog)")
    public Object around(ProceedingJoinPoint point) throws Throwable {
        long startTime = System.currentTimeMillis();
        MethodSignature signature = (MethodSignature) point.getSignature();
        Method method = signature.getMethod();
        OperLog annotation = method.getAnnotation(OperLog.class);

        OperationLog operLog = new OperationLog();
        operLog.setModule(annotation.module());
        operLog.setOperation(annotation.operation());
        operLog.setMethod(method.getDeclaringClass().getName() + "." + method.getName());

        try {
            HttpServletRequest request = getRequest();
            if (request != null) {
                operLog.setIp(getClientIp(request));
            }

            UserContext userContext = UserContext.get();
            if (userContext != null) {
                operLog.setOperatorId(userContext.getUserId());
                operLog.setOperatorName(userContext.getUsername());
                operLog.setOperatorRole(userContext.getRole());
            }

            Object[] args = point.getArgs();
            String params = Arrays.stream(args)
                    .filter(arg -> !(arg instanceof MultipartFile) && !(arg instanceof MultipartFile[]))
                    .map(arg -> {
                        try {
                            return JSON.toJSONString(arg);
                        } catch (Exception e) {
                            return arg.toString();
                        }
                    })
                    .collect(Collectors.joining(", "));
            operLog.setRequestParams(params.length() > 2000 ? params.substring(0, 2000) : params);

            Object result = point.proceed();

            String resultStr = JSON.toJSONString(result);
            operLog.setResponseResult(resultStr.length() > 2000 ? resultStr.substring(0, 2000) : resultStr);
            operLog.setStatus(1);

            return result;
        } catch (Throwable e) {
            operLog.setStatus(0);
            operLog.setErrorMsg(e.getMessage() != null ?
                    (e.getMessage().length() > 500 ? e.getMessage().substring(0, 500) : e.getMessage())
                    : "系统异常");
            throw e;
        } finally {
            operLog.setOperateTime(LocalDateTime.now());
            operLog.setCostTime(System.currentTimeMillis() - startTime);
            saveLog(operLog);
        }
    }

    @Async
    public void saveLog(OperationLog log) {
        try {
            logMapper.insert(log);
        } catch (Exception e) {
            e.printStackTrace();
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
