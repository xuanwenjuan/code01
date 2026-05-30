package com.spring.manufacturing.aspect;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.spring.manufacturing.annotation.OperationLog;
import com.spring.manufacturing.entity.SysUser;
import com.spring.manufacturing.mapper.SysUserMapper;
import com.spring.manufacturing.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class OperationLogAspect {

    private final ObjectMapper objectMapper;
    private final JwtUtil jwtUtil;
    private final SysUserMapper sysUserMapper;
    private final RedisTemplate<String, Object> redisTemplate;

    private static final String LOG_CACHE_KEY = "operation:log:";

    @Around("@annotation(operationLog)")
    public Object around(ProceedingJoinPoint joinPoint, OperationLog operationLog) throws Throwable {
        long startTime = System.currentTimeMillis();
        LocalDateTime operationTime = LocalDateTime.now();

        HttpServletRequest request = getRequest();
        String token = request != null ? request.getHeader("Authorization") : null;
        Long userId = null;
        String username = null;
        String realName = null;

        if (token != null && token.startsWith("Bearer ")) {
            try {
                token = token.substring(7);
                userId = jwtUtil.getUserIdFromToken(token);
                username = jwtUtil.getUsernameFromToken(token);
                SysUser user = sysUserMapper.selectById(userId);
                if (user != null) {
                    realName = user.getRealName();
                }
            } catch (Exception e) {
                log.warn("解析用户信息失败: {}", e.getMessage());
            }
        }

        String ipAddress = getIpAddress(request);
        String requestMethod = request != null ? request.getMethod() : "";
        String requestUrl = request != null ? request.getRequestURI() : "";

        Map<String, Object> logMap = new HashMap<>();
        logMap.put("userId", userId);
        logMap.put("username", username);
        logMap.put("realName", realName);
        logMap.put("module", operationLog.module());
        logMap.put("type", operationLog.type());
        logMap.put("description", operationLog.description());
        logMap.put("requestMethod", requestMethod);
        logMap.put("requestUrl", requestUrl);
        logMap.put("ipAddress", ipAddress);
        logMap.put("operationTime", operationTime);

        Object result = null;
        try {
            Object[] args = joinPoint.getArgs();
            StringBuilder params = new StringBuilder();
            for (Object arg : args) {
                if (arg != null && !isIgnoredType(arg.getClass())) {
                    try {
                        params.append(objectMapper.writeValueAsString(arg)).append(" ");
                    } catch (Exception e) {
                        params.append(arg.toString()).append(" ");
                    }
                }
            }
            logMap.put("requestParams", params.toString().trim());

            result = joinPoint.proceed();

            long costTime = System.currentTimeMillis() - startTime;
            logMap.put("costTime", costTime);
            logMap.put("status", 1);

            try {
                String resultStr = objectMapper.writeValueAsString(result);
                logMap.put("responseResult", resultStr.length() > 2000 ? resultStr.substring(0, 2000) + "..." : resultStr);
            } catch (Exception e) {
                logMap.put("responseResult", result != null ? result.toString() : "");
            }

            saveOperationLog(logMap);
            log.info("操作成功 - 模块: {}, 类型: {}, 描述: {}, 耗时: {}ms",
                    operationLog.module(), operationLog.type(), operationLog.description(), costTime);

        } catch (Throwable e) {
            long costTime = System.currentTimeMillis() - startTime;
            logMap.put("costTime", costTime);
            logMap.put("status", 0);
            logMap.put("errorMsg", e.getMessage());

            saveOperationLog(logMap);
            log.error("操作失败 - 模块: {}, 类型: {}, 描述: {}, 错误: {}",
                    operationLog.module(), operationLog.type(), operationLog.description(), e.getMessage());
            throw e;
        }

        return result;
    }

    private HttpServletRequest getRequest() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            return attributes != null ? attributes.getRequest() : null;
        } catch (Exception e) {
            return null;
        }
    }

    private String getIpAddress(HttpServletRequest request) {
        if (request == null) {
            return "unknown";
        }
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
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }

    private boolean isIgnoredType(Class<?> clazz) {
        return HttpServletRequest.class.isAssignableFrom(clazz)
                || jakarta.servlet.http.HttpServletResponse.class.isAssignableFrom(clazz)
                || org.springframework.web.multipart.MultipartFile.class.isAssignableFrom(clazz);
    }

    private void saveOperationLog(Map<String, Object> logMap) {
        try {
            String logId = System.currentTimeMillis() + ":" + (int) (Math.random() * 10000);
            redisTemplate.opsForHash().putAll(LOG_CACHE_KEY + logId, logMap);
            redisTemplate.expireAt(LOG_CACHE_KEY + logId,
                    java.util.Date.from(java.time.LocalDateTime.now().plusDays(7).atZone(java.time.ZoneId.systemDefault()).toInstant()));
        } catch (Exception e) {
            log.error("保存操作日志到Redis失败", e);
        }
    }
}