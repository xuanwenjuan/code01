package com.fan.impeller.aspect;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fan.impeller.annotation.Log;
import com.fan.impeller.context.UserContext;
import com.fan.impeller.entity.OperationLog;
import com.fan.impeller.mapper.OperationLogMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
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
    private final ObjectMapper objectMapper;

    @Pointcut("@annotation(com.fan.impeller.annotation.Log)")
    public void logPointCut() {
    }

    @SneakyThrows
    @Around("logPointCut()")
    public Object around(ProceedingJoinPoint point) {
        long beginTime = System.currentTimeMillis();

        Object result = point.proceed();

        long duration = System.currentTimeMillis() - beginTime;

        try {
            saveLog(point, result, duration);
        } catch (Exception e) {
            log.error("保存操作日志失败", e);
        }

        return result;
    }

    private void saveLog(ProceedingJoinPoint point, Object result, long duration) throws Exception {
        MethodSignature signature = (MethodSignature) point.getSignature();
        Method method = signature.getMethod();

        OperationLog operationLog = new OperationLog();

        Log logAnnotation = method.getAnnotation(Log.class);
        if (logAnnotation != null) {
            operationLog.setModule(logAnnotation.module());
            operationLog.setOperation(logAnnotation.operation());
        }

        String className = point.getTarget().getClass().getName();
        String methodName = signature.getName();
        operationLog.setMethod(className + "." + methodName + "()");

        Object[] args = point.getArgs();
        try {
            operationLog.setParams(objectMapper.writeValueAsString(args));
        } catch (Exception e) {
            operationLog.setParams("参数序列化失败");
        }

        HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest();
        operationLog.setIp(getIpAddr(request));

        operationLog.setUserId(UserContext.getUserId());
        operationLog.setUsername(UserContext.getUsername());

        try {
            operationLog.setResult(objectMapper.writeValueAsString(result));
        } catch (Exception e) {
            operationLog.setResult("结果序列化失败");
        }

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
