package com.naturaldye.aspect;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.naturaldye.annotation.OperationLog;
import com.naturaldye.entity.SysUser;
import com.naturaldye.mapper.SysUserMapper;
import com.naturaldye.util.JwtUtil;
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

    private final JwtUtil jwtUtil;
    private final SysUserMapper sysUserMapper;
    private final ObjectMapper objectMapper;

    @Pointcut("@annotation(com.naturaldye.annotation.OperationLog)")
    public void operationLogPointcut() {
    }

    @Around("operationLogPointcut()")
    public Object around(ProceedingJoinPoint joinPoint) throws Throwable {
        long startTime = System.currentTimeMillis();
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        OperationLog operationLog = method.getAnnotation(OperationLog.class);

        com.naturaldye.entity.OperationLog logEntity = new com.naturaldye.entity.OperationLog();
        logEntity.setCreateTime(LocalDateTime.now());

        try {
            HttpServletRequest request = getRequest();
            if (request != null) {
                String token = request.getHeader("Authorization");
                if (token != null && token.startsWith("Bearer ")) {
                    token = token.substring(7);
                    try {
                        Long userId = jwtUtil.getUserIdFromToken(token);
                        String username = jwtUtil.getUsernameFromToken(token);
                        logEntity.setUserId(userId);
                        logEntity.setUsername(username);
                    } catch (Exception e) {
                        log.warn("解析token失败: {}", e.getMessage());
                    }
                }
                logEntity.setIp(getIpAddr(request));
            }

            logEntity.setModule(operationLog.module());
            logEntity.setOperation(operationLog.operation());
            logEntity.setDescription(operationLog.description());
            logEntity.setMethod(method.getDeclaringClass().getName() + "." + method.getName());

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
                        logEntity.setParams(params.substring(0, 2000));
                    } else {
                        logEntity.setParams(params.toString());
                    }
                } catch (Exception e) {
                    log.warn("序列化参数失败: {}", e.getMessage());
                }
            }

            Object result = joinPoint.proceed();
            logEntity.setStatus(1);
            logEntity.setCostTime(System.currentTimeMillis() - startTime);

            return result;

        } catch (Exception e) {
            logEntity.setStatus(0);
            logEntity.setErrorMsg(e.getMessage());
            logEntity.setCostTime(System.currentTimeMillis() - startTime);
            throw e;
        } finally {
            try {
                com.naturaldye.mapper.OperationLogMapper operationLogMapper =
                        SpringContextHolder.getBean(com.naturaldye.mapper.OperationLogMapper.class);
                if (operationLogMapper != null) {
                    operationLogMapper.insert(logEntity);
                }
            } catch (Exception e) {
                log.error("保存操作日志失败: {}", e.getMessage());
            }
        }
    }

    private HttpServletRequest getRequest() {
        try {
            ServletRequestAttributes attributes =
                    (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            return attributes != null ? attributes.getRequest() : null;
        } catch (Exception e) {
            return null;
        }
    }

    private String getIpAddr(HttpServletRequest request) {
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
        return ip;
    }

    private boolean isIgnoredType(Class<?> clazz) {
        return HttpServletRequest.class.isAssignableFrom(clazz)
                || jakarta.servlet.http.HttpServletResponse.class.isAssignableFrom(clazz)
                || org.springframework.web.multipart.MultipartFile.class.isAssignableFrom(clazz);
    }
}
