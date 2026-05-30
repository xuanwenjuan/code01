package com.mushroom.traceability.service;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.mushroom.traceability.entity.OperationLog;
import com.mushroom.traceability.mapper.OperationLogMapper;
import com.mushroom.traceability.util.UserContext;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class OperationLogService extends ServiceImpl<OperationLogMapper, OperationLog> {

    public void saveLog(String bizType, Long bizId, String operationType, String content) {
        OperationLog log = new OperationLog();
        log.setBizType(bizType);
        log.setBizId(bizId);
        log.setOperationType(operationType);
        log.setOperationContent(content);
        log.setOperatorId(UserContext.getUserId());
        log.setOperatorName(UserContext.getUsername());
        log.setOperatorRole(UserContext.getRole());
        log.setCreateTime(LocalDateTime.now());
        save(log);
    }
}