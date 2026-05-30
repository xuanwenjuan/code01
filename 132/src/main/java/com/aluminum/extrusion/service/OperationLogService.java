package com.aluminum.extrusion.service;

import com.aluminum.extrusion.entity.OperationLog;
import com.aluminum.extrusion.mapper.OperationLogMapper;
import com.aluminum.extrusion.util.UserContext;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class OperationLogService extends ServiceImpl<OperationLogMapper, OperationLog> {

    @Async
    public void log(String operationType, String content) {
        OperationLog log = new OperationLog();
        log.setOperationType(operationType);
        log.setContent(content);
        log.setOperator(UserContext.getUsername() != null ? UserContext.getUsername() : "system");
        save(log);
    }
}
