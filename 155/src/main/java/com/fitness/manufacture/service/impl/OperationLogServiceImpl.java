package com.fitness.manufacture.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.fitness.manufacture.common.PageQuery;
import com.fitness.manufacture.entity.OperationLog;
import com.fitness.manufacture.mapper.OperationLogMapper;
import com.fitness.manufacture.service.OperationLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class OperationLogServiceImpl extends ServiceImpl<OperationLogMapper, OperationLog> implements OperationLogService {

    private final OperationLogMapper operationLogMapper;

    @Override
    public IPage<OperationLog> getLogPage(PageQuery query, String module, Long userId, Integer status) {
        LambdaQueryWrapper<OperationLog> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(module)) {
            wrapper.like(OperationLog::getModule, module);
        }
        if (userId != null) {
            wrapper.eq(OperationLog::getUserId, userId);
        }
        if (status != null) {
            wrapper.eq(OperationLog::getStatus, status);
        }
        wrapper.orderByDesc(OperationLog::getOperTime);

        Page<OperationLog> page = new Page<>(query.getPageNum(), query.getPageSize());
        return operationLogMapper.selectPage(page, wrapper);
    }
}
