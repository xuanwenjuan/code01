package com.liquor.brewing.aspect;

import cn.hutool.core.util.StrUtil;
import cn.hutool.json.JSONUtil;
import com.liquor.brewing.annotation.Log;
import com.liquor.brewing.entity.OperationLog;
import com.liquor.brewing.mapper.OperationLogMapper;
import com.liquor.brewing.util.UserContext;
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

import java.time.LocalDateTime;

@Slf4j
@Aspect
@Component
public class LogAspect {

    @Resource
    private OperationLogMapper operationLogMapper;

    @Around("@annotation(logAnnotation)")
    public Object around(ProceedingJoinPoint joinPoint, Log logAnnotation) throws Throwable {
        long startTime = System.currentTimeMillis();
        Object result = null;
        Exception exception = null;

        try {
            result = joinPoint.proceed();
            return result;
        } catch (Exception e) {
            exception = e;
            throw e;
        } finally {
            try {
                saveLog(joinPoint, logAnnotation, startTime, result, exception);
            } catch (Exception e) {
                log.error("保存操作日志失败", e);
            }
        }
    }

    private void saveLog(ProceedingJoinPoint joinPoint, Log logAnnotation, long startTime, Object result, Exception exception) {
        OperationLog operationLog = new OperationLog();
        operationLog.setModule(logAnnotation.module());
        operationLog.setOperationType(logAnnotation.operationType());
        operationLog.setOperationDesc(logAnnotation.description());

        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        operationLog.setMethod(signature.getDeclaringTypeName() + "." + signature.getName());

        Object[] args = joinPoint.getArgs();
        try {
            if (args != null && args.length > 0) {
                operationLog.setRequestParams(JSONUtil.toJsonStr(args));
            }
        } catch (Exception e) {
            operationLog.setRequestParams("参数解析失败");
        }

        try {
            if (result != null) {
                String resultStr = JSONUtil.toJsonStr(result);
                if (resultStr.length() > 2000) {
                    resultStr = resultStr.substring(0, 2000) + "...";
                }
                operationLog.setResponseResult(resultStr);
            }
        } catch (Exception e) {
            operationLog.setResponseResult("结果解析失败");
        }

        try {
            Long userId = UserContext.getUserId();
            operationLog.setUserId(userId);
            operationLog.setUsername(UserContext.getUsername());
        } catch (Exception ignored) {
        }

        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            operationLog.setIpAddress(getIpAddress(request));
        }

        operationLog.setOperationTime(LocalDateTime.now());
        operationLog.setCostTime(System.currentTimeMillis() - startTime);

        if (exception != null) {
            operationLog.setStatus(0);
            String errorMsg = exception.getMessage();
            if (StrUtil.isNotBlank(errorMsg) && errorMsg.length() > 1000) {
                errorMsg = errorMsg.substring(0, 1000) + "...";
            }
            operationLog.setErrorMsg(errorMsg);
        } else {
            operationLog.setStatus(1);
        }

        operationLogMapper.insert(operationLog);
    }

    private String getIpAddress(HttpServletRequest request) {
        String ip = request.getHeader("x-forwarded-for");
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_CLIENT_IP");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_X_FORWARDED_FOR");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }
}
