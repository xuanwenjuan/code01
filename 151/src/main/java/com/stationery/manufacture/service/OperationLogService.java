package com.stationery.manufacture.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.stationery.manufacture.entity.OperationLog;
import com.stationery.manufacture.mapper.OperationLogMapper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;

@Service
public class OperationLogService {

    private final OperationLogMapper logMapper;

    public OperationLogService(OperationLogMapper logMapper) {
        this.logMapper = logMapper;
    }

    public Page<OperationLog> getLogPage(Integer pageNum, Integer pageSize,
                                         String module, String operatorName,
                                         LocalDateTime startTime, LocalDateTime endTime) {
        Page<OperationLog> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<OperationLog> wrapper = new LambdaQueryWrapper<>();

        if (StringUtils.hasText(module)) {
            wrapper.eq(OperationLog::getModule, module);
        }
        if (StringUtils.hasText(operatorName)) {
            wrapper.like(OperationLog::getOperatorName, operatorName);
        }
        if (startTime != null) {
            wrapper.ge(OperationLog::getOperateTime, startTime);
        }
        if (endTime != null) {
            wrapper.le(OperationLog::getOperateTime, endTime);
        }

        wrapper.orderByDesc(OperationLog::getOperateTime);
        return logMapper.selectPage(page, wrapper);
    }

    public OperationLog getLogById(Long id) {
        return logMapper.selectById(id);
    }
}
