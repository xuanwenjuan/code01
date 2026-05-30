package com.foundry.impeller.aspect;

import com.foundry.impeller.entity.ProductionLog;
import com.foundry.impeller.mapper.ProductionLogMapper;
import com.foundry.impeller.util.UserContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class OperationLogAspect {

    private final ProductionLogMapper productionLogMapper;

    @Pointcut("@annotation(com.foundry.impeller.annotation.OperationLog)")
    public void operationLogPointcut() {
    }

    @Around("operationLogPointcut() && @annotation(operationLogAnno)")
    public Object around(ProceedingJoinPoint joinPoint, com.foundry.impeller.annotation.OperationLog operationLogAnno) throws Throwable {
        String operationType = operationLogAnno.value();
        String module = operationLogAnno.module();

        Object result;
        try {
            result = joinPoint.proceed();
            saveOperationLog(module + "-" + operationType, getOperationContent(joinPoint), "SUCCESS", null);
        } catch (Exception e) {
            saveOperationLog(module + "-" + operationType, getOperationContent(joinPoint), "FAILED", e.getMessage());
            throw e;
        }
        return result;
    }

    private void saveOperationLog(String operationType, String operationContent, String status, String errorMsg) {
        try {
            ProductionLog log = new ProductionLog();
            log.setOperationType(operationType);
            log.setOperationContent(operationContent + (errorMsg != null ? " 错误信息:" + errorMsg : ""));
            log.setOperatorId(UserContext.getUserId());
            log.setOperatorName(UserContext.getUsername() != null ? UserContext.getUsername() : "system");
            log.setOperatorRole(UserContext.getRole() != null ? UserContext.getRole() : "SYSTEM");
            productionLogMapper.insert(log);
        } catch (Exception e) {
            log.error("保存操作日志失败", e);
        }
    }

    private String getOperationContent(ProceedingJoinPoint joinPoint) {
        Object[] args = joinPoint.getArgs();
        StringBuilder content = new StringBuilder();
        for (Object arg : args) {
            if (arg != null) {
                content.append(arg.toString()).append(";");
            }
        }
        return content.length() > 500 ? content.substring(0, 500) : content.toString();
    }
}
