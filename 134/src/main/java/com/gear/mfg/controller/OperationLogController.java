package com.gear.mfg.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.gear.mfg.annotation.RequireRole;
import com.gear.mfg.common.PageResult;
import com.gear.mfg.common.Result;
import com.gear.mfg.entity.OperationLogEntity;
import com.gear.mfg.mapper.OperationLogMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/operation-log")
@RequiredArgsConstructor
public class OperationLogController {

    private final OperationLogMapper operationLogMapper;

    @GetMapping("/list")
    @RequireRole({"ADMIN"})
    public Result<PageResult<OperationLogEntity>> getOperationLogList(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String module,
            @RequestParam(required = false) String operation,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endDate) {

        Page<OperationLogEntity> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<OperationLogEntity> wrapper = new LambdaQueryWrapper<>();

        if (module != null) {
            wrapper.like(OperationLogEntity::getModule, module);
        }
        if (operation != null) {
            wrapper.like(OperationLogEntity::getOperation, operation);
        }
        if (username != null) {
            wrapper.like(OperationLogEntity::getUsername, username);
        }
        if (status != null) {
            wrapper.eq(OperationLogEntity::getStatus, status);
        }
        if (startDate != null) {
            wrapper.ge(OperationLogEntity::getStartTime, startDate);
        }
        if (endDate != null) {
            wrapper.le(OperationLogEntity::getStartTime, endDate);
        }
        wrapper.orderByDesc(OperationLogEntity::getStartTime);

        Page<OperationLogEntity> result = operationLogMapper.selectPage(page, wrapper);
        PageResult<OperationLogEntity> pageResult = new PageResult<>(
                result.getRecords(), result.getTotal(), pageNum, pageSize
        );
        return Result.success(pageResult);
    }

    @GetMapping("/{id}")
    @RequireRole({"ADMIN"})
    public Result<OperationLogEntity> getOperationLogById(@PathVariable Long id) {
        OperationLogEntity log = operationLogMapper.selectById(id);
        return Result.success(log);
    }
}
