package com.snacktrace.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.snacktrace.entity.OperationLog;
import com.snacktrace.mapper.OperationLogMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class OperationLogService extends ServiceImpl<OperationLogMapper, OperationLog> {

    public void saveLog(Long userId, String username, String module, String type, String desc, String ip) {
        OperationLog log = new OperationLog();
        log.setUserId(userId);
        log.setUsername(username);
        log.setOperationModule(module);
        log.setOperationType(type);
        log.setOperationDesc(desc);
        log.setIpAddress(ip);
        log.setCreateTime(LocalDateTime.now());
        save(log);
    }

    public Page<OperationLog> getLogPage(int page, int size, Long userId, String module, String type) {
        LambdaQueryWrapper<OperationLog> wrapper = new LambdaQueryWrapper<>();
        if (userId != null) {
            wrapper.eq(OperationLog::getUserId, userId);
        }
        if (module != null && !module.isEmpty()) {
            wrapper.like(OperationLog::getOperationModule, module);
        }
        if (type != null && !type.isEmpty()) {
            wrapper.eq(OperationLog::getOperationType, type);
        }
        wrapper.orderByDesc(OperationLog::getCreateTime);
        return page(new Page<>(page, size), wrapper);
    }
}
