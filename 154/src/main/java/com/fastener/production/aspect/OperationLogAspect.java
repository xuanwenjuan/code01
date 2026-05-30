package com.fastener.production.aspect;

import cn.hutool.core.util.StrUtil;
import cn.hutool.json.JSONUtil;
import com.fastener.production.common.annotation.OperationLog;
import com.fastener.production.common.utils.UserContext;
import com.fastener.production.entity.system.OperationLog;
import com.fastener.production.service.system.OperationLogService;
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

    private final OperationLogService operationLogService;

    @Pointcut("@annotation(com.fastener.production.common.annotation.OperationLog)")
    public void operationLogPointcut() {
    }

    @Around("operationLogPointcut()")
    public Object around(ProceedingJoinPoint joinPoint) throws Throwable {
        long startTime = System.currentTimeMillis();
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        OperationLog annotation = method.getAnnotation(OperationLog.class);

        OperationLog logEntity = new OperationLog();
        logEntity.setLogNo("LOG" + System.currentTimeMillis());
        logEntity.setOperationType(annotation.operationType().getCode());
        logEntity.setModuleCode(annotation.moduleCode());
        logEntity.setModuleName(annotation.moduleName());
        logEntity.setRemark(annotation.description());
        logEntity.setOperatorId(UserContext.getUserId());
        logEntity.setOperatorName(UserContext.getUsername());
        logEntity.setOperationTime(LocalDateTime.now());

        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            logEntity.setIpAddress(getIpAddress(request));
            logEntity.setUserAgent(request.getHeader("User-Agent"));
            logEntity.setRequestUrl(request.getRequestURI());
            logEntity.setRequestMethod(request.getMethod());

            try {
                Object[] args = joinPoint.getArgs();
                if (args != null && args.length > 0) {
                    StringBuilder params = new StringBuilder();
                    for (Object arg : args) {
                        if (arg != null && !isIgnoreType(arg.getClass())) {
                            params.append(JSONUtil.toJsonStr(arg)).append(";");
                        }
                    }
                    if (params.length() > 2000) {
                        logEntity.setRequestParams(params.substring(0, 2000) + "...");
                    } else {
                        logEntity.setRequestParams(params.toString());
                    }
                }
            } catch (Exception e) {
                log.warn("获取请求参数失败：{}", e.getMessage());
            }
        }

        Object result = null;
        try {
            result = joinPoint.proceed();
            logEntity.setStatus(1);

            try {
                if (result != null) {
                    String resultStr = JSONUtil.toJsonStr(result);
                    if (resultStr.length() > 2000) {
                        logEntity.setResponseResult(resultStr.substring(0, 2000) + "...");
                    } else {
                        logEntity.setResponseResult(resultStr);
                    }
                }
            } catch (Exception e) {
                log.warn("获取响应结果失败：{}", e.getMessage());
            }
        } catch (Throwable e) {
            logEntity.setStatus(0);
            logEntity.setErrorMsg(e.getMessage());
            throw e;
        } finally {
            long costTime = System.currentTimeMillis() - startTime;
            logEntity.setCostTime(costTime);

            try {
                operationLogService.asyncSaveLog(logEntity);
            } catch (Exception e) {
                log.error("保存操作日志失败：{}", e.getMessage());
            }
        }

        return result;
    }

    private boolean isIgnoreType(Class<?> clazz) {
        return HttpServletRequest.class.isAssignableFrom(clazz)
                || jakarta.servlet.http.HttpServletResponse.class.isAssignableFrom(clazz)
                || org.springframework.web.multipart.MultipartFile.class.isAssignableFrom(clazz);
    }

    private String getIpAddress(HttpServletRequest request) {
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
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }
}
