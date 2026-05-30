package com.oiledumbrella.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.oiledumbrella.entity.OperationLog;
import com.oiledumbrella.mapper.OperationLogMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class OperationLogService {

    private final OperationLogMapper operationLogMapper;

    @Async
    public void saveLog(OperationLog operationLog) {
        try {
            operationLog.setOperationTime(LocalDateTime.now());
            operationLogMapper.insert(operationLog);
        } catch (Exception e) {
            log.error("保存操作日志失败", e);
        }
    }

    public Page<OperationLog> page(Integer pageNum, Integer pageSize, Long userId, String businessType, String operationType) {
        Page<OperationLog> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<OperationLog> wrapper = new LambdaQueryWrapper<>();
        if (userId != null) {
            wrapper.eq(OperationLog::getUserId, userId);
        }
        if (businessType != null && !businessType.isEmpty()) {
            wrapper.eq(OperationLog::getBusinessType, businessType);
        }
        if (operationType != null && !operationType.isEmpty()) {
            wrapper.eq(OperationLog::getOperationType, operationType);
        }
        wrapper.orderByDesc(OperationLog::getOperationTime);
        return operationLogMapper.selectPage(page, wrapper);
    }
}
