package com.paper.production.aspect;

import cn.hutool.core.util.StrUtil;
import cn.hutool.json.JSONUtil;
import com.paper.production.annotation.OperateLog;
import com.paper.production.entity.system.OperationLog;
import com.paper.production.service.system.OperationLogService;
import com.paper.production.utils.UserContextUtil;
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

import java.lang.reflect.Method;

@Slf4j
@Aspect
@Component
public class OperationLogAspect {

    @Resource
    private OperationLogService operationLogService;

    @Around("@annotation(operateLog)")
    public Object around(ProceedingJoinPoint point, OperateLog operateLog) throws Throwable {
        long startTime = System.currentTimeMillis();
        OperationLog operationLog = new OperationLog();

        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                operationLog.setIp(request.getRemoteAddr());
                operationLog.setMethod(request.getMethod());
            }

            MethodSignature signature = (MethodSignature) point.getSignature();
            Method method = signature.getMethod();

            operationLog.setModule(operateLog.module());
            operationLog.setOperation(operateLog.operation());
            operationLog.setDescription(operateLog.description());
            operationLog.setUserId(UserContextUtil.getUserId());
            operationLog.setUsername(UserContextUtil.getUsername());

            Object[] args = point.getArgs();
            try {
                if (args != null && args.length > 0) {
                    String params = JSONUtil.toJsonStr(args);
                    if (params.length() > 2000) {
                        params = params.substring(0, 2000) + "...";
                    }
                    operationLog.setParams(params);
                }
            } catch (Exception e) {
                log.warn("参数序列化失败", e);
            }

            Object result = point.proceed();

            operationLog.setStatus(1);
            operationLog.setCostTime(System.currentTimeMillis() - startTime);
            operationLogService.saveLogAsync(operationLog);

            return result;
        } catch (Exception e) {
            operationLog.setStatus(0);
            operationLog.setErrorMsg(StrUtil.maxLength(e.getMessage(), 500, "..."));
            operationLog.setCostTime(System.currentTimeMillis() - startTime);
            operationLogService.saveLogAsync(operationLog);
            throw e;
        }
    }
}
