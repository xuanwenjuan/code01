package com.watchrepair.admin.aspect;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.watchrepair.admin.annotation.OperationLogger;
import com.watchrepair.admin.service.OperationLogService;
import com.watchrepair.admin.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.lang.reflect.Method;

@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class OperationLogAspect {

    private final OperationLogService operationLogService;
    private final ObjectMapper objectMapper;
    private final JwtUtil jwtUtil;

    @Around("@annotation(com.watchrepair.admin.annotation.OperationLogger)")
    public Object around(ProceedingJoinPoint joinPoint) throws Throwable {
        long startTime = System.currentTimeMillis();

        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        OperationLogger operationLogger = method.getAnnotation(OperationLogger.class);
        String operation = operationLogger.value();
        String methodName = signature.getDeclaringTypeName() + "." + method.getName();

        Long userId = null;
        String username = null;
        try {
            HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest();
            String token = request.getHeader("Authorization");
            if (StringUtils.hasText(token) && token.startsWith("Bearer ")) {
                token = token.substring(7);
                if (jwtUtil.validateToken(token)) {
                    userId = jwtUtil.getUserIdFromToken(token);
                    username = jwtUtil.getUsernameFromToken(token);
                }
            }
        } catch (Exception e) {
            log.warn("获取用户信息失败", e);
        }

        String params = "";
        try {
            Object[] args = joinPoint.getArgs();
            params = objectMapper.writeValueAsString(args);
            if (params.length() > 2000) {
                params = params.substring(0, 2000) + "...";
            }
        } catch (Exception e) {
            params = "参数解析失败";
        }

        int status = 1;
        String errorMsg = null;
        Object result = null;

        try {
            result = joinPoint.proceed();
        } catch (Throwable e) {
            status = 0;
            errorMsg = e.getMessage();
            if (errorMsg != null && errorMsg.length() > 500) {
                errorMsg = errorMsg.substring(0, 500);
            }
            throw e;
        } finally {
            long duration = System.currentTimeMillis() - startTime;
            try {
                operationLogService.saveLog(userId, username, operation, methodName, params, duration, status, errorMsg);
            } catch (Exception e) {
                log.error("保存操作日志失败", e);
            }
        }

        return result;
    }
}