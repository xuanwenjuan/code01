package com.incense.aspect;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.incense.annotation.OperationLog;
import com.incense.context.UserContext;
import com.incense.entity.OperationLogEntity;
import com.incense.service.OperationLogService;
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
import java.time.LocalDateTime;

@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class OperationLogAspect {

    private final ObjectMapper objectMapper;
    private final OperationLogService operationLogService;

    @Pointcut("@annotation(com.incense.annotation.OperationLog)")
    public void operationLogPointcut() {
    }

    @Around("operationLogPointcut()")
    public Object around(ProceedingJoinPoint joinPoint) throws Throwable {
        long startTime = System.currentTimeMillis();

        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        OperationLog annotation = method.getAnnotation(OperationLog.class);

        OperationLogEntity logEntity = new OperationLogEntity();
        logEntity.setUserId(UserContext.getUserId());
        logEntity.setUsername(UserContext.getUsername());
        logEntity.setOperation(annotation.operation());
        logEntity.setModule(annotation.module());
        logEntity.setMethod(method.getDeclaringClass().getName() + "." + method.getName());

        HttpServletRequest request = getRequest();
        if (request != null) {
            logEntity.setIp(getClientIp(request));
        }

        if (annotation.logParams()) {
            try {
                Object[] args = joinPoint.getArgs();
                if (args != null && args.length > 0) {
                    StringBuilder params = new StringBuilder();
                    for (Object arg : args) {
                        if (arg != null && !isIgnoredParam(arg)) {
                            params.append(objectMapper.writeValueAsString(arg)).append(";");
                        }
                    }
                    logEntity.setParams(params.length() > 2000 ? params.substring(0, 2000) : params.toString());
                }
            } catch (Exception e) {
                log.warn("记录操作日志参数失败", e);
            }
        }

        logEntity.setOperationTime(LocalDateTime.now());
        Object result = null;

        try {
            result = joinPoint.proceed();
            logEntity.setStatus(1);

            if (annotation.logResult()) {
                try {
                    String resultStr = objectMapper.writeValueAsString(result);
                    logEntity.setResult(resultStr.length() > 2000 ? resultStr.substring(0, 2000) : resultStr);
                } catch (Exception e) {
                    log.warn("记录操作日志返回值失败", e);
                }
            }

            return result;
        } catch (Throwable e) {
            logEntity.setStatus(0);
            logEntity.setErrorMsg(e.getMessage() != null ?
                    (e.getMessage().length() > 500 ? e.getMessage().substring(0, 500) : e.getMessage()) : null);
            throw e;
        } finally {
            logEntity.setDuration(System.currentTimeMillis() - startTime);
            try {
                operationLogService.asyncSaveLog(logEntity);
            } catch (Exception e) {
                log.error("保存操作日志失败", e);
            }
        }
    }

    private HttpServletRequest getRequest() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        return attributes != null ? attributes.getRequest() : null;
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }

    private boolean isIgnoredParam(Object arg) {
        return arg instanceof HttpServletRequest
                || arg instanceof HttpServletRequest
                || arg instanceof byte[]
                || (arg != null && arg.getClass().isArray() && arg.getClass().getComponentType().isPrimitive());
    }
}
