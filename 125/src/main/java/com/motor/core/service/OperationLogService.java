package com.motor.core.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.motor.core.entity.OperationLog;
import com.motor.core.mapper.OperationLogMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class OperationLogService extends ServiceImpl<OperationLogMapper, OperationLog> {

    public Page<OperationLog> getPage(int pageNum, int pageSize, String module, Long operatorId, 
                                      LocalDateTime startTime, LocalDateTime endTime) {
        LambdaQueryWrapper<OperationLog> wrapper = new LambdaQueryWrapper<>();
        if (module != null && !module.isEmpty()) {
            wrapper.eq(OperationLog::getModule, module);
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
        return page(new Page<>(pageNum, pageSize), wrapper);
    }
}
