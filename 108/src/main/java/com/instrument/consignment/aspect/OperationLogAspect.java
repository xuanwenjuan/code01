package com.instrument.consignment.aspect;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.instrument.consignment.annotation.OperationLog;
import com.instrument.consignment.enums.BizTypeEnum;
import com.instrument.consignment.enums.OperationTypeEnum;
import com.instrument.consignment.mapper.OperationLogMapper;
import com.instrument.consignment.po.OperationLogPO;
import com.instrument.consignment.util.UserContext;
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

import java.lang.reflect.Method;
import java.time.LocalDateTime;

@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class OperationLogAspect {

    private final OperationLogMapper operationLogMapper;
    private final ObjectMapper objectMapper;

    @Around("@annotation(com.instrument.consignment.annotation.OperationLog)")
    public Object around(ProceedingJoinPoint joinPoint) throws Throwable {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        OperationLog operationLog = method.getAnnotation(OperationLog.class);

        BizTypeEnum bizType = operationLog.bizType();
        OperationTypeEnum operationType = operationLog.operationType();
        String description = operationLog.description();

        Object[] args = joinPoint.getArgs();
        String beforeContent = null;
        if (args != null && args.length > 0) {
            beforeContent = toJsonString(args);
        }

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
                String afterContent = toJsonString(result);

                OperationLogPO logPO = new OperationLogPO();
                logPO.setBizType(bizType.getCode());
                logPO.setBizId(extractBizId(args, result));
                logPO.setOperationType(operationType.getCode());
                logPO.setOperationDesc(description);
                logPO.setBeforeContent(beforeContent);
                logPO.setAfterContent(afterContent);
                logPO.setOperatorId(UserContext.getUserId());
                logPO.setOperatorName(UserContext.getUsername());
                logPO.setIpAddress(getIpAddress());
                logPO.setCreateTime(LocalDateTime.now());

                operationLogMapper.insert(logPO);
            } catch (Exception e) {
                log.error("记录操作日志失败", e);
            }
        }
    }

    private Long extractBizId(Object[] args, Object result) {
        if (result instanceof Long) {
            return (Long) result;
        }
        if (args != null && args.length > 0 && args[0] instanceof Long) {
            return (Long) args[0];
        }
        return null;
    }

    private String getIpAddress() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                return request.getRemoteAddr();
            }
        } catch (Exception e) {
            log.error("获取IP地址失败", e);
        }
        return null;
    }

    private String toJsonString(Object obj) {
        if (obj == null) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            return obj.toString();
        }
    }
}
