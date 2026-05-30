package com.gearbox.manage.aspect;

import com.gearbox.manage.annotation.Log;
import com.gearbox.manage.service.OperationLogService;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;

@Aspect
@Component
@RequiredArgsConstructor
public class LogAspect {

    private final OperationLogService operationLogService;

    @Pointcut("@annotation(com.gearbox.manage.annotation.Log)")
    public void logPointCut() {
    }

    @Around("logPointCut() && @annotation(logAnnotation)")
    public Object around(ProceedingJoinPoint joinPoint, Log logAnnotation) throws Throwable {
        long beginTime = System.currentTimeMillis();
        Object result = null;
        Exception exception = null;

        try {
            result = joinPoint.proceed();
            return result;
        } catch (Exception e) {
            exception = e;
            throw e;
        } finally {
            long duration = System.currentTimeMillis() - beginTime;
            try {
                operationLogService.saveLog(
                    logAnnotation.module(),
                    logAnnotation.operation(),
                    joinPoint,
                    duration,
                    result,
                    exception
                );
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
}
