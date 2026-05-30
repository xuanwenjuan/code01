package com.valve.manufacture.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.valve.manufacture.annotation.RequiresRole;
import com.valve.manufacture.common.Result;
import com.valve.manufacture.constant.RoleConstants;
import com.valve.manufacture.entity.OperationLog;
import com.valve.manufacture.service.OperationLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/operation-logs")
@RequiredArgsConstructor
@RequiresRole(RoleConstants.ADMIN)
public class OperationLogController {

    private final OperationLogService operationLogService;

    @GetMapping
    public Result<Page<OperationLog>> page(
            @RequestParam(defaultValue = "1") Integer current,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String moduleName,
            @RequestParam(required = false) Long operatorId,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startTime,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endTime) {
        Page<OperationLog> page = operationLogService.page(current, size, moduleName, operatorId, startTime, endTime);
        return Result.success(page);
    }

    @GetMapping("/{id}")
    public Result<OperationLog> getById(@PathVariable Long id) {
        OperationLog log = operationLogService.getById(id);
        return Result.success(log);
    }
}
