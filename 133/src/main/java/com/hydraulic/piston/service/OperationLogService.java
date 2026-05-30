package com.hydraulic.piston.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.hydraulic.piston.entity.OperationLog;
import com.hydraulic.piston.mapper.OperationLogMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OperationLogService {

    private final OperationLogMapper logMapper;

    public Page<OperationLog> getPage(Integer pageNum, Integer pageSize, Long userId, String module, Integer status) {
        Page<OperationLog> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<OperationLog> wrapper = new LambdaQueryWrapper<>();

        if (userId != null) {
            wrapper.eq(OperationLog::getUserId, userId);
        }
        if (module != null && !module.isEmpty()) {
            wrapper.like(OperationLog::getModule, module);
        }
        if (status != null) {
            wrapper.eq(OperationLog::getStatus, status);
        }
        wrapper.orderByDesc(OperationLog::getCreateTime);

        return logMapper.selectPage(page, wrapper);
    }

    public OperationLog getById(Long id) {
        return logMapper.selectById(id);
    }

    public void delete(Long id) {
        logMapper.deleteById(id);
    }
}
