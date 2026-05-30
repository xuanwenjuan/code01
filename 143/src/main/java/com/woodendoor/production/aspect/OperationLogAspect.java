package com.woodendoor.production.aspect;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.woodendoor.production.annotation.OperationLog;
import com.woodendoor.production.context.UserContext;
import com.woodendoor.production.entity.SysUser;
import com.woodendoor.production.mapper.OperationLogMapper;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletRequest;
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
import java.time.LocalDateTime;

@Slf4j
@Aspect
@Component
public class OperationLogAspect {

    @Resource
    private OperationLogMapper operationLogMapper;

    @Resource
    private ObjectMapper objectMapper;

    @Pointcut("@annotation(com.woodendoor.production.annotation.OperationLog)")
    public void operationLogPointcut() {
    }

    @Around("operationLogPointcut()")
    public Object around(ProceedingJoinPoint joinPoint) throws Throwable {
        long startTime = System.currentTimeMillis();
        
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        OperationLog operationLog = method.getAnnotation(OperationLog.class);
        
        com.woodendoor.production.entity.OperationLog logEntity = 
                new com.woodendoor.production.entity.OperationLog();
        
        SysUser user = UserContext.getUser();
        if (user != null) {
            logEntity.setUserId(user.getId());
            logEntity.setUsername(user.getRealName());
        }
        
        logEntity.setModule(operationLog.module());
        logEntity.setOperation(operationLog.operation());
        logEntity.setMethod(method.getDeclaringClass().getName() + "." + method.getName());
        
        try {
            Object[] args = joinPoint.getArgs();
            if (args != null && args.length > 0) {
                String params = objectMapper.writeValueAsString(args);
                logEntity.setParams(params.length() > 2000 ? params.substring(0, 2000) : params);
            }
        } catch (Exception e) {
            log.error("获取参数异常", e);
        }
        
        HttpServletRequest request = getRequest();
        if (request != null) {
            logEntity.setIp(getIpAddr(request));
        }
        
        Object result = null;
        try {
            result = joinPoint.proceed();
            try {
                if (result != null) {
                    String resultStr = objectMapper.writeValueAsString(result);
                    logEntity.setResult(resultStr.length() > 2000 ? resultStr.substring(0, 2000) : resultStr);
                }
            } catch (Exception e) {
                log.error("序列化结果异常", e);
            }
            return result;
        } catch (Throwable e) {
            logEntity.setResult("异常：" + e.getMessage());
            throw e;
        } finally {
            long time = System.currentTimeMillis() - startTime;
            logEntity.setTime(time);
            logEntity.setCreateTime(LocalDateTime.now());
            try {
                operationLogMapper.insert(logEntity);
            } catch (Exception e) {
                log.error("保存操作日志异常", e);
            }
        }
    }

    private HttpServletRequest getRequest() {
        ServletRequestAttributes attributes = 
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
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
            ip = request.getRemoteAddr();
        }
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }
}
