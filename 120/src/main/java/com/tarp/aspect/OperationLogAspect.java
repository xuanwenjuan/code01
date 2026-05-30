package com.tarp.aspect;

import com.tarp.annotation.OperationLog;
import com.tarp.entity.SysOperationLog;
import com.tarp.mapper.SysOperationLogMapper;
import com.tarp.util.JwtUtil;
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
public class OperationLogAspect {

    private final SysOperationLogMapper operationLogMapper;
    private final JwtUtil jwtUtil;

    @Pointcut("@annotation(com.tarp.annotation.OperationLog)")
    public void logPointCut() {
    }

    @Around("logPointCut()")
    public Object around(ProceedingJoinPoint point) throws Throwable {
        long beginTime = System.currentTimeMillis();
        Object result = point.proceed();
        long costTime = System.currentTimeMillis() - beginTime;

        try {
            saveOperationLog(point, costTime);
        } catch (Exception e) {
            log.error("保存操作日志失败", e);
        }

        return result;
    }

    private void saveOperationLog(ProceedingJoinPoint joinPoint, long costTime) {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();

        SysOperationLog operationLog = new SysOperationLog();

        OperationLog logAnnotation = method.getAnnotation(OperationLog.class);
        if (logAnnotation != null) {
            operationLog.setOperation(logAnnotation.value());
        }

        String className = joinPoint.getTarget().getClass().getName();
        String methodName = signature.getName();
        operationLog.setMethod(className + "." + methodName + "()");

        HttpServletRequest request = getRequest();
        if (request != null) {
            String token = request.getHeader("Authorization");
            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring(7);
                if (jwtUtil.validateToken(token)) {
                    operationLog.setUserId(jwtUtil.getUserIdFromToken(token));
                    operationLog.setUsername(jwtUtil.getUsernameFromToken(token));
                }
            }
            operationLog.setIp(getIpAddr(request));
        }

        operationLog.setCostTime(costTime);
        operationLogMapper.insert(operationLog);
    }

    private HttpServletRequest getRequest() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        return attributes != null ? attributes.getRequest() : null;
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
        return ip;
    }
}
