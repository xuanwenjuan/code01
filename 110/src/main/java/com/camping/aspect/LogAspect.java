package com.camping.aspect;

import com.alibaba.fastjson2.JSON;
import com.camping.annotation.Log;
import com.camping.context.UserContext;
import com.camping.entity.OperationLog;
import com.camping.mapper.OperationLogMapper;
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

import java.lang.reflect.Method;

@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class LogAspect {

    private final OperationLogMapper operationLogMapper;

    @Pointcut("@annotation(com.camping.annotation.Log)")
    public void logPointCut() {
    }

    @Around("logPointCut()")
    public Object around(ProceedingJoinPoint point) throws Throwable {
        long beginTime = System.currentTimeMillis();
        Object result = point.proceed();
        long duration = System.currentTimeMillis() - beginTime;
        saveLog(point, result, duration);
        return result;
    }

    private void saveLog(ProceedingJoinPoint joinPoint, Object result, Long duration) {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        OperationLog operationLog = new OperationLog();
        Log logAnnotation = method.getAnnotation(Log.class);
        if (logAnnotation != null) {
            operationLog.setModule(logAnnotation.module());
            operationLog.setOperation(logAnnotation.operation());
        }
        String className = joinPoint.getTarget().getClass().getName();
        String methodName = signature.getName();
        operationLog.setMethod(className + "." + methodName + "()");
        Object[] args = joinPoint.getArgs();
        try {
            String params = JSON.toJSONString(args);
            if (params.length() > 2000) {
                params = params.substring(0, 2000);
            }
            operationLog.setParams(params);
            String resultStr = JSON.toJSONString(result);
            if (resultStr.length() > 2000) {
                resultStr = resultStr.substring(0, 2000);
            }
            operationLog.setResult(resultStr);
        } catch (Exception e) {
            log.error("序列化参数异常", e);
        }
        try {
            HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest();
            operationLog.setIp(getIpAddr(request));
        } catch (Exception e) {
            log.error("获取IP异常", e);
        }
        operationLog.setUserId(UserContext.getUserId());
        operationLog.setUsername(UserContext.getUsername());
        operationLog.setDuration(duration);
        operationLogMapper.insert(operationLog);
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
