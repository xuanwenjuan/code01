package com.bee.equipment.aspect;

import com.bee.equipment.annotation.OperationLog;
import com.bee.equipment.po.OperationLogPO;
import com.bee.equipment.service.OperationLogService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;

@Slf4j
@Aspect
@Component
public class OperationLogAspect {

    @Autowired
    private OperationLogService operationLogService;

    @Autowired
    private ObjectMapper objectMapper;

    @Around("@annotation(operationLog)")
    public Object around(ProceedingJoinPoint joinPoint, OperationLog operationLog) throws Throwable {
        long startTime = System.currentTimeMillis();

        HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest();
        Long userId = (Long) request.getAttribute("userId");
        String username = (String) request.getAttribute("username");

        OperationLogPO logPO = new OperationLogPO();
        logPO.setUserId(userId);
        logPO.setUsername(username);
        logPO.setModule(operationLog.module());
        logPO.setDescription(operationLog.description());
        logPO.setIp(getClientIp(request));
        logPO.setRequestUrl(request.getRequestURI());
        logPO.setRequestMethod(request.getMethod());
        logPO.setCreateTime(LocalDateTime.now());

        try {
            Object[] args = joinPoint.getArgs();
            if (args != null && args.length > 0) {
                try {
                    StringBuilder params = new StringBuilder();
                    for (Object arg : args) {
                        if (arg != null && !isIgnoredType(arg.getClass())) {
                            params.append(objectMapper.writeValueAsString(arg)).append(";");
                        }
                    }
                    if (params.length() > 2000) {
                        logPO.setRequestParams(params.substring(0, 2000));
                    } else {
                        logPO.setRequestParams(params.toString());
                    }
                } catch (Exception e) {
                    log.warn("序列化请求参数失败", e);
                }
            }
        } catch (Exception e) {
            log.warn("处理请求参数失败", e);
        }

        Object result = null;
        try {
            result = joinPoint.proceed();
            logPO.setStatus(1);

            try {
                if (result != null) {
                    String resultStr = objectMapper.writeValueAsString(result);
                    if (resultStr.length() > 2000) {
                        logPO.setResponseResult(resultStr.substring(0, 2000));
                    } else {
                        logPO.setResponseResult(resultStr);
                    }
                }
            } catch (Exception e) {
                log.warn("序列化响应结果失败", e);
            }

            return result;
        } catch (Throwable e) {
            logPO.setStatus(0);
            logPO.setErrorMsg(e.getMessage() != null ? e.getMessage().substring(0, 500) : null);
            throw e;
        } finally {
            long endTime = System.currentTimeMillis();
            logPO.setCostTime(endTime - startTime);

            try {
                operationLogService.saveLogAsync(logPO);
            } catch (Exception e) {
                log.error("保存操作日志失败", e);
            }

            log.info("操作记录 - 模块：{}，描述：{}，操作人：{}，IP：{}，耗时：{}ms，状态：{}",
                    logPO.getModule(), logPO.getDescription(), logPO.getUsername(),
                    logPO.getIp(), logPO.getCostTime(), logPO.getStatus() == 1 ? "成功" : "失败");
        }
    }

    private boolean isIgnoredType(Class<?> clazz) {
        String className = clazz.getName();
        return className.contains("HttpServletRequest") ||
               className.contains("HttpServletResponse") ||
               className.contains("MultipartFile");
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
            ip = request.getRemoteAddr();
        }
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }
}
