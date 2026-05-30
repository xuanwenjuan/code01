package com.gearbox.manage.service;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.gearbox.manage.context.UserContext;
import com.gearbox.manage.entity.OperationLog;
import com.gearbox.manage.mapper.OperationLogMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.ProceedingJoinPoint;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class OperationLogService extends ServiceImpl<OperationLogMapper, OperationLog> {

    public void saveLog(String module, String operation, ProceedingJoinPoint joinPoint, long duration, Object result, Exception e) {
        OperationLog log = new OperationLog();
        log.setUserId(UserContext.getUserId());
        log.setUsername(UserContext.getUsername());
        log.setModule(module);
        log.setOperation(operation);
        log.setDuration(duration);
        log.setCreateTime(LocalDateTime.now());

        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            log.setIp(getIpAddr(request));
            log.setMethod(request.getMethod());
        }

        try {
            log.setParams(com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(joinPoint.getArgs()));
        } catch (Exception ex) {
            log.setParams("参数序列化失败");
        }

        if (e != null) {
            log.setStatus(0);
            log.setErrorMsg(e.getMessage());
        } else {
            log.setStatus(1);
            try {
                log.setResult(com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(result));
            } catch (Exception ex) {
                log.setResult("结果序列化失败");
            }
        }

        save(log);
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
        return "0:0:0:0:0:0:0:1".equals(ip) ? "127.0.0.1" : ip.split(",")[0].trim();
    }
}
