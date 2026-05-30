package com.plastic.injection.aspect;

import com.plastic.injection.annotation.OperationLog;
import com.plastic.injection.context.UserContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class OperationLogAspect {

    private final RedisTemplate<String, Object> redisTemplate;

    @Pointcut("@annotation(com.plastic.injection.annotation.OperationLog)")
    public void logPointCut() {
    }

    @Around("logPointCut()")
    public Object around(ProceedingJoinPoint point) throws Throwable {
        long beginTime = System.currentTimeMillis();
        Object result = point.proceed();
        long time = System.currentTimeMillis() - beginTime;

        try {
            MethodSignature signature = (MethodSignature) point.getSignature();
            OperationLog operationLog = signature.getMethod().getAnnotation(OperationLog.class);

            Map<String, Object> logMap = new HashMap<>();
            logMap.put("id", UUID.randomUUID().toString());
            logMap.put("module", operationLog.module());
            logMap.put("description", operationLog.description());
            logMap.put("userId", UserContext.getUserId());
            logMap.put("username", UserContext.getUsername());
            logMap.put("method", signature.getName());
            logMap.put("params", point.getArgs());
            logMap.put("time", time);
            logMap.put("createTime", LocalDateTime.now().toString());

            String key = "operation:log:" + System.currentTimeMillis();
            redisTemplate.opsForList().leftPush("operation:logs", logMap);
            redisTemplate.expire("operation:logs", 7, java.util.concurrent.TimeUnit.DAYS);

            log.info("操作日志 - 模块: {}, 描述: {}, 用户: {}, 耗时: {}ms",
                    operationLog.module(), operationLog.description(),
                    UserContext.getUsername(), time);
        } catch (Exception e) {
            log.error("记录操作日志异常", e);
        }

        return result;
    }
}
