package com.paper.production.service.system.impl;

import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.paper.production.common.PageQuery;
import com.paper.production.common.PageResult;
import com.paper.production.entity.system.OperationLog;
import com.paper.production.mapper.system.OperationLogMapper;
import com.paper.production.service.system.OperationLogService;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class OperationLogServiceImpl extends ServiceImpl<OperationLogMapper, OperationLog> implements OperationLogService {

    @Override
    public PageResult<OperationLog> queryLogPage(PageQuery query) {
        LambdaQueryWrapper<OperationLog> wrapper = new LambdaQueryWrapper<>();
        if (StrUtil.isNotBlank(query.getKeyword())) {
            wrapper.and(w -> w.like(OperationLog::getModule, query.getKeyword())
                    .or().like(OperationLog::getOperation, query.getKeyword())
                    .or().like(OperationLog::getUsername, query.getKeyword()));
        }
        wrapper.orderByDesc(OperationLog::getCreateTime);

        Page<OperationLog> page = page(new Page<>(query.getCurrent(), query.getSize()), wrapper);
        return PageResult.of(page.getTotal(), page.getPages(), page.getCurrent(), page.getSize(), page.getRecords());
    }

    @Override
    @Async
    public void saveLogAsync(OperationLog log) {
        save(log);
    }
}
