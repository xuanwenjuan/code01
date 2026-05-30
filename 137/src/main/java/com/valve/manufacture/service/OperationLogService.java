package com.valve.manufacture.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.valve.manufacture.entity.OperationLog;
import com.valve.manufacture.mapper.OperationLogMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class OperationLogService extends ServiceImpl<OperationLogMapper, OperationLog> {

    public void log(String operationType, String moduleName, Long businessId, String businessNo,
                    Long operatorId, String operatorName, String operationContent, String ipAddress) {
        OperationLog log = new OperationLog();
        log.setOperationType(operationType);
        log.setModuleName(moduleName);
        log.setBusinessId(businessId);
        log.setBusinessNo(businessNo);
        log.setOperatorId(operatorId);
        log.setOperatorName(operatorName);
        log.setOperationContent(operationContent);
        log.setIpAddress(ipAddress);
        log.setCreateTime(LocalDateTime.now());
        save(log);
    }

    public Page<OperationLog> page(Integer current, Integer size, String moduleName, Long operatorId,
                                    LocalDateTime startTime, LocalDateTime endTime) {
        LambdaQueryWrapper<OperationLog> wrapper = new LambdaQueryWrapper<>();
        if (moduleName != null && !moduleName.isEmpty()) {
            wrapper.eq(OperationLog::getModuleName, moduleName);
        }
        if (operatorId != null) {
            wrapper.eq(OperationLog::getOperatorId, operatorId);
        }
        if (startTime != null) {
            wrapper.ge(OperationLog::getCreateTime, startTime);
        }
        if (endTime != null) {
            wrapper.le(OperationLog::getCreateTime, endTime);
        }
        wrapper.orderByDesc(OperationLog::getCreateTime);

        return page(new Page<>(current, size), wrapper);
    }
}
