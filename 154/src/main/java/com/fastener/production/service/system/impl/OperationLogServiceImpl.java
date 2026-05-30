package com.fastener.production.service.system.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.fastener.production.common.entity.PageQuery;
import com.fastener.production.entity.system.OperationLog;
import com.fastener.production.mapper.system.OperationLogMapper;
import com.fastener.production.service.system.OperationLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class OperationLogServiceImpl extends ServiceImpl<OperationLogMapper, OperationLog> implements OperationLogService {

    private final OperationLogMapper operationLogMapper;

    @Override
    public IPage<OperationLog> page(PageQuery pageQuery, Integer operationType, String moduleCode,
                                    Long operatorId, String startTime, String endTime) {
        Page<OperationLog> page = new Page<>(pageQuery.getPageNum(), pageQuery.getPageSize());
        LambdaQueryWrapper<OperationLog> wrapper = new LambdaQueryWrapper<>();
        if (operationType != null) {
            wrapper.eq(OperationLog::getOperationType, operationType);
        }
        if (moduleCode != null && !moduleCode.isEmpty()) {
            wrapper.eq(OperationLog::getModuleCode, moduleCode);
        }
        if (operatorId != null) {
            wrapper.eq(OperationLog::getOperatorId, operatorId);
        }
        if (startTime != null && !startTime.isEmpty()) {
            wrapper.ge(OperationLog::getOperationTime, LocalDateTime.parse(startTime));
        }
        if (endTime != null && !endTime.isEmpty()) {
            wrapper.le(OperationLog::getOperationTime, LocalDateTime.parse(endTime));
        }
        wrapper.orderByDesc(OperationLog::getOperationTime);
        return this.page(page, wrapper);
    }

    @Override
    @Async
    public void asyncSaveLog(OperationLog log) {
        operationLogMapper.insert(log);
    }
}
