package com.household.management.common.aspect;

import cn.hutool.core.util.StrUtil;
import cn.hutool.http.useragent.UserAgent;
import cn.hutool.http.useragent.UserAgentUtil;
import cn.hutool.json.JSONUtil;
import com.household.management.common.annotation.OperationLog;
import com.household.management.entity.SysOperationLog;
import com.household.management.mapper.SysOperationLogMapper;
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

import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.stream.Collectors;

@Slf4j
@Aspect
@Component
public class OperationLogAspect {

    private final SysOperationLogMapper operationLogMapper;

    public OperationLogAspect(SysOperationLogMapper operationLogMapper) {
        this.operationLogMapper = operationLogMapper;
    }

    @Around("@annotation(operationLog)")
    public Object around(ProceedingJoinPoint joinPoint, OperationLog operationLog) throws Throwable {
        long startTime = System.currentTimeMillis();
        Object result = null;
        int status = 1;
        String errorMsg = null;

        try {
            result = joinPoint.proceed();
            return result;
        } catch (Throwable e) {
            status = 0;
            errorMsg = e.getMessage();
            throw e;
        } finally {
            long costTime = System.currentTimeMillis() - startTime;
            saveLog(joinPoint, operationLog, result, status, errorMsg, costTime);
        }
    }

    @Async
    public void saveLog(ProceedingJoinPoint joinPoint, OperationLog operationLog, Object result,
                        int status, String errorMsg, long costTime) {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes == null) {
                return;
            }
            HttpServletRequest request = attributes.getRequest();

            MethodSignature signature = (MethodSignature) joinPoint.getSignature();
            Method method = signature.getMethod();

            SysOperationLog sysLog = new SysOperationLog();
            sysLog.setModule(operationLog.module());
            sysLog.setOperation(operationLog.operation());
            sysLog.setMethod(method.getDeclaringClass().getName() + "." + method.getName());

            if (operationLog.saveParams()) {
                Object[] args = joinPoint.getArgs();
                if (args != null && args.length > 0) {
                    String params = Arrays.stream(args)
                            .filter(arg -> !(arg instanceof jakarta.servlet.http.HttpServletRequest ||
                                    arg instanceof jakarta.servlet.http.HttpServletResponse))
                            .map(arg -> {
                                try {
                                    return JSONUtil.toJsonStr(arg);
                                } catch (Exception e) {
                                    return String.valueOf(arg);
                                }
                            })
                            .collect(Collectors.joining(", "));
                    sysLog.setParams(StrUtil.sub(params, 0, 2000));
                }
            }

            if (operationLog.saveResult() && result != null) {
                sysLog.setResult(StrUtil.sub(JSONUtil.toJsonStr(result), 0, 2000));
            }

            sysLog.setOperator(getCurrentUsername());
            sysLog.setIp(getClientIp(request));
            sysLog.setCostTime(costTime);
            sysLog.setStatus(status);
            sysLog.setErrorMsg(StrUtil.sub(errorMsg, 0, 500));

            operationLogMapper.insert(sysLog);
        } catch (Exception e) {
            log.error("保存操作日志失败", e);
        }
    }

    private String getCurrentUsername() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                Object username = request.getAttribute("currentUsername");
                if (username != null) {
                    return username.toString();
                }
            }
        } catch (Exception e) {
            log.warn("获取当前用户失败", e);
        }
        return "system";
    }

    private String getClientIp(HttpServletRequest request) {
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
        return StrUtil.subBefore(ip, ",", false);
    }
}
