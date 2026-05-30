package com.snack.processing.aspect;

import cn.hutool.core.util.StrUtil;
import cn.hutool.json.JSONUtil;
import com.snack.processing.annotation.OperationLog;
import com.snack.processing.entity.SysOperationLog;
import com.snack.processing.mapper.SysOperationLogMapper;
import com.snack.processing.util.SecurityUtil;
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

import java.time.LocalDateTime;
import java.util.Arrays;

@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class OperationLogAspect {

    private final SysOperationLogMapper operationLogMapper;

    @Around("@annotation(operationLog)")
    public Object around(ProceedingJoinPoint joinPoint, OperationLog operationLog) throws Throwable {
        long startTime = System.currentTimeMillis();

        SysOperationLog sysLog = new SysOperationLog();
        sysLog.setModule(operationLog.module());
        sysLog.setOperation(operationLog.operation());
        sysLog.setDescription(operationLog.description());
        sysLog.setOperationTime(LocalDateTime.now());

        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                sysLog.setRequestUrl(request.getRequestURI());
                sysLog.setRequestMethod(request.getMethod());
                sysLog.setIp(getClientIp(request));
            }

            MethodSignature signature = (MethodSignature) joinPoint.getSignature();
            String className = joinPoint.getTarget().getClass().getName();
            String methodName = signature.getName();
            sysLog.setMethod(className + "." + methodName + "()");

            Object[] args = joinPoint.getArgs();
            String[] parameterNames = signature.getParameterNames();
            if (args != null && args.length > 0) {
                StringBuilder params = new StringBuilder();
                for (int i = 0; i < args.length; i++) {
                    if (i > 0) {
                        params.append(", ");
                    }
                    params.append(parameterNames[i]).append("=");
                    try {
                        params.append(JSONUtil.toJsonStr(args[i]));
                    } catch (Exception e) {
                        params.append(args[i]);
                    }
                }
                sysLog.setRequestParams(StrUtil.sub(params.toString(), 0, 2000));
            }

            sysLog.setUserId(SecurityUtil.getCurrentUserId());
            sysLog.setUsername(SecurityUtil.getCurrentUsername());

            Object result = joinPoint.proceed();

            long costTime = System.currentTimeMillis() - startTime;
            sysLog.setCostTime(costTime);
            sysLog.setStatus(1);

            try {
                sysLog.setResponseResult(StrUtil.sub(JSONUtil.toJsonStr(result), 0, 2000));
            } catch (Exception e) {
                sysLog.setResponseResult(result != null ? result.toString() : "");
            }

            return result;
        } catch (Throwable e) {
            long costTime = System.currentTimeMillis() - startTime;
            sysLog.setCostTime(costTime);
            sysLog.setStatus(0);
            sysLog.setErrorMsg(StrUtil.sub(e.getMessage(), 0, 500));
            throw e;
        } finally {
            try {
                operationLogMapper.insert(sysLog);
            } catch (Exception e) {
                log.error("保存操作日志失败", e);
            }
        }
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
        if (ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }
}
