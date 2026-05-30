package com.logistics.bigcargo.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.logistics.bigcargo.common.Result;
import com.logistics.bigcargo.entity.OperationLog;
import com.logistics.bigcargo.mapper.OperationLogMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/operation-logs")
public class OperationLogController {

    @Autowired
    private OperationLogMapper operationLogMapper;

    @GetMapping("/page")
    @PreAuthorize("hasAnyRole('WAREHOUSE_ADMIN', 'DISPATCHER')")
    public Result<Page<OperationLog>> getLogPage(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String businessNo,
            @RequestParam(required = false) String businessType,
            @RequestParam(required = false) Long operatorId) {
        LambdaQueryWrapper<OperationLog> wrapper = new LambdaQueryWrapper<>();
        if (businessNo != null && !businessNo.isEmpty()) {
            wrapper.eq(OperationLog::getBusinessNo, businessNo);
        }
        if (businessType != null && !businessType.isEmpty()) {
            wrapper.eq(OperationLog::getBusinessType, businessType);
        }
        if (operatorId != null) {
            wrapper.eq(OperationLog::getOperatorId, operatorId);
        }
        wrapper.orderByDesc(OperationLog::getCreateTime);

        return Result.success(operationLogMapper.selectPage(new Page<>(pageNum, pageSize), wrapper));
    }
}
