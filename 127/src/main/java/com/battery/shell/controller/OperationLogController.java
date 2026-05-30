package com.battery.shell.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.battery.shell.annotation.RequireRole;
import com.battery.shell.common.Result;
import com.battery.shell.constant.RoleConstant;
import com.battery.shell.entity.OperationLog;
import com.battery.shell.service.OperationLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/log")
@RequiredArgsConstructor
public class OperationLogController {

    private final OperationLogService operationLogService;

    @GetMapping("/list")
    @RequireRole({RoleConstant.ADMIN})
    public Result<IPage<OperationLog>> getLogList(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String module,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startTime,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endTime) {
        return Result.success(operationLogService.getLogList(page, size, username, module, startTime, endTime));
    }

    @GetMapping("/{id}")
    @RequireRole({RoleConstant.ADMIN})
    public Result<OperationLog> getLogById(@PathVariable Long id) {
        return Result.success(operationLogService.getLogById(id));
    }
}
