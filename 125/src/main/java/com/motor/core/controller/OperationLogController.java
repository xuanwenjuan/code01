package com.motor.core.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.motor.core.annotation.OperationLog;
import com.motor.core.common.Result;
import com.motor.core.entity.po.OperationLogPO;
import com.motor.core.mapper.OperationLogMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/log")
@RequiredArgsConstructor
public class OperationLogController {
    private final OperationLogMapper operationLogMapper;

    @GetMapping("/page")
    @OperationLog(module = "日志管理", operation = "分页查询", description = "分页查询操作日志")
    public Result<Page<OperationLogPO>> queryPage(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String module,
            @RequestParam(required = false) Long operatorId,
            @RequestParam(required = false) LocalDateTime startTime,
            @RequestParam(required = false) LocalDateTime endTime) {

        Page<OperationLogPO> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<OperationLogPO> wrapper = new LambdaQueryWrapper<>();
        if (module != null && !module.isEmpty()) {
            wrapper.eq(OperationLogPO::getModule, module);
        }
        if (operatorId != null) {
            wrapper.eq(OperationLogPO::getOperatorId, operatorId);
        }
        if (startTime != null) {
            wrapper.ge(OperationLogPO::getCreateTime, startTime);
        }
        if (endTime != null) {
            wrapper.le(OperationLogPO::getCreateTime, endTime);
        }
        wrapper.orderByDesc(OperationLogPO::getCreateTime);

        Page<OperationLogPO> result = operationLogMapper.selectPage(page, wrapper);
        return Result.success(result);
    }

    @GetMapping("/{id}")
    @OperationLog(module = "日志管理", operation = "查询详情", description = "查询操作日志详情")
    public Result<OperationLogPO> getById(@PathVariable Long id) {
        return Result.success(operationLogMapper.selectById(id));
    }
}
