package com.logistics.bigcargo.util;

import com.logistics.bigcargo.entity.OperationLog;
import com.logistics.bigcargo.mapper.OperationLogMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class OperationLogUtil {

    @Autowired
    private OperationLogMapper operationLogMapper;

    public void log(String operationType, String businessNo, String businessType,
                   Long operatorId, String operatorName, String operationContent) {
        OperationLog log = new OperationLog();
        log.setOperationType(operationType);
        log.setBusinessNo(businessNo);
        log.setBusinessType(businessType);
        log.setOperatorId(operatorId);
        log.setOperatorName(operatorName);
        log.setOperationContent(operationContent);
        operationLogMapper.insert(log);
    }
}
