package com.stationery.manufacture.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.stationery.manufacture.common.RequireRole;
import com.stationery.manufacture.common.Result;
import com.stationery.manufacture.entity.OperationLog;
import com.stationery.manufacture.service.OperationLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/log")
@Tag(name = "操作日志管理")
@RequireRole({"ADMIN"})
public class OperationLogController {

    private final OperationLogService logService;

    public OperationLogController(OperationLogService logService) {
        this.logService = logService;
    }

    @GetMapping("/page")
    @Operation(summary = "分页查询操作日志")
    public Result<Page<OperationLog>> getPage(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String module,
            @RequestParam(required = false) String operatorName,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startTime,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endTime) {
        return Result.success(logService.getLogPage(pageNum, pageSize, module, operatorName, startTime, endTime));
    }

    @GetMapping("/{id}")
    @Operation(summary = "获取日志详情")
    public Result<OperationLog> getById(@PathVariable Long id) {
        return Result.success(logService.getLogById(id));
    }
}
