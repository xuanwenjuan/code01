package com.evparts.aspect;

import cn.hutool.core.util.StrUtil;
import cn.hutool.json.JSONUtil;
import com.evparts.annotation.OperationLog;
import com.evparts.entity.SysOperationLog;
import com.evparts.mapper.SysOperationLogMapper;
import com.evparts.utils.UserContext;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.lang.reflect.Method;
import java.time.LocalDateTime;

@Slf4j
@Aspect
@Component
public class OperationLogAspect {

    @Autowired
    private SysOperationLogMapper operationLogMapper;

    @Around("@annotation(operationLog)")
    public Object around(ProceedingJoinPoint joinPoint, OperationLog operationLog) throws Throwable {
        long startTime = System.currentTimeMillis();
        Object result = null;
        int status = 1;
        String errorMsg = null;

        try {
            result = joinPoint.proceed();
        } catch (Throwable e) {
            status = 0;
            errorMsg = e.getMessage();
            throw e;
        } finally {
            long costTime = System.currentTimeMillis() - startTime;
            saveOperationLog(joinPoint, operationLog, status, errorMsg, costTime);
        }

        return result;
    }

    @Async
    public void saveOperationLog(ProceedingJoinPoint joinPoint, OperationLog operationLog, int status, String errorMsg, long costTime) {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            HttpServletRequest request = attributes != null ? attributes.getRequest() : null;

            SysOperationLog sysLog = new SysOperationLog();
            sysLog.setUserId(UserContext.getUserId());
            sysLog.setUsername(UserContext.getUsername());

            String operation = operationLog.operation();
            if (StrUtil.isBlank(operation)) {
                operation = operationLog.value();
            }
            if (StrUtil.isBlank(operation)) {
                MethodSignature signature = (MethodSignature) joinPoint.getSignature();
                operation = signature.getMethod().getName();
            }
            sysLog.setOperation(operation);

            MethodSignature signature = (MethodSignature) joinPoint.getSignature();
            Method method = signature.getMethod();
            sysLog.setMethod(method.getDeclaringClass().getName() + "." + method.getName());

            Object[] args = joinPoint.getArgs();
            try {
                sysLog.setParams(JSONUtil.toJsonStr(args));
            } catch (Exception e) {
                sysLog.setParams("参数解析失败");
            }

            if (request != null) {
                String ip = request.getHeader("X-Forwarded-For");
                if (StrUtil.isBlank(ip) || "unknown".equalsIgnoreCase(ip)) {
                    ip = request.getHeader("Proxy-Client-IP");
                }
                if (StrUtil.isBlank(ip) || "unknown".equalsIgnoreCase(ip)) {
                    ip = request.getHeader("WL-Proxy-Client-IP");
                }
                if (StrUtil.isBlank(ip) || "unknown".equalsIgnoreCase(ip)) {
                    ip = request.getRemoteAddr();
                }
                sysLog.setIp(ip);
            }

            sysLog.setStatus(status);
            sysLog.setErrorMsg(errorMsg);
            sysLog.setCostTime(costTime);
            sysLog.setCreateTime(LocalDateTime.now());

            operationLogMapper.insert(sysLog);
        } catch (Exception e) {
            log.error("保存操作日志失败", e);
        }
    }

}
