package com.leathercraft.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.leathercraft.context.UserContext;
import com.leathercraft.entity.OperationLog;
import com.leathercraft.mapper.OperationLogMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;
import java.util.List;

@Aspect
@Service
@RequiredArgsConstructor
public class OperationLogService {

    private final OperationLogMapper operationLogMapper;

    @Around("execution(* com.leathercraft.controller..*.*(..)) && !execution(* com.leathercraft.controller.AuthController.*(..))")
    public Object around(ProceedingJoinPoint joinPoint) throws Throwable {
        long startTime = System.currentTimeMillis();

        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        HttpServletRequest request = attributes != null ? attributes.getRequest() : null;

        OperationLog log = new OperationLog();
        log.setUserId(UserContext.getUserId());
        log.setUsername(UserContext.getUsername());
        log.setOperationTime(LocalDateTime.now());

        if (request != null) {
            log.setRequestUrl(request.getRequestURI());
            log.setRequestMethod(request.getMethod());
            log.setIpAddress(getClientIp(request));
        }

        String methodName = joinPoint.getSignature().getName();
        String className = joinPoint.getTarget().getClass().getSimpleName();
        log.setOperationModule(className.replace("Controller", ""));
        log.setOperationType(determineOperationType(methodName));
        log.setOperationDesc(determineOperationDesc(methodName));

        Object result;
        try {
            result = joinPoint.proceed();
            log.setCostTime(System.currentTimeMillis() - startTime);
            operationLogMapper.insert(log);
            return result;
        } catch (Throwable e) {
            log.setCostTime(System.currentTimeMillis() - startTime);
            log.setOperationDesc(log.getOperationDesc() + " - 失败: " + e.getMessage());
            operationLogMapper.insert(log);
            throw e;
        }
    }

    private String determineOperationType(String methodName) {
        if (methodName.startsWith("create") || methodName.startsWith("add") || methodName.startsWith("save")) {
            return "新增";
        } else if (methodName.startsWith("update") || methodName.startsWith("edit") || methodName.startsWith("modify")) {
            return "修改";
        } else if (methodName.startsWith("delete") || methodName.startsWith("remove")) {
            return "删除";
        } else if (methodName.startsWith("get") || methodName.startsWith("list") || methodName.startsWith("query")) {
            return "查询";
        } else {
            return "其他";
        }
    }

    private String determineOperationDesc(String methodName) {
        if (methodName.startsWith("create") || methodName.startsWith("add")) {
            return "创建记录";
        } else if (methodName.startsWith("update")) {
            return "更新记录";
        } else if (methodName.startsWith("delete")) {
            return "删除记录";
        } else if (methodName.startsWith("list")) {
            return "查询列表";
        } else if (methodName.startsWith("get")) {
            return "查询详情";
        } else {
            return methodName;
        }
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_CLIENT_IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_X_FORWARDED_FOR");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }

    public List<OperationLog> list(LocalDateTime startTime, LocalDateTime endTime, Long userId) {
        LambdaQueryWrapper<OperationLog> wrapper = new LambdaQueryWrapper<>();
        if (startTime != null) {
            wrapper.ge(OperationLog::getOperationTime, startTime);
        }
        if (endTime != null) {
            wrapper.le(OperationLog::getOperationTime, endTime);
        }
        if (userId != null) {
            wrapper.eq(OperationLog::getUserId, userId);
        }
        wrapper.orderByDesc(OperationLog::getOperationTime);
        return operationLogMapper.selectList(wrapper);
    }
}
