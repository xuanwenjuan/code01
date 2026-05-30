package com.snacktrace.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.snacktrace.annotation.RequireRole;
import com.snacktrace.common.Result;
import com.snacktrace.entity.OperationLog;
import com.snacktrace.enums.RoleEnum;
import com.snacktrace.service.OperationLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/log")
public class OperationLogController {

    @Autowired
    private OperationLogService logService;

    @GetMapping("/page")
    @RequireRole({RoleEnum.ADMIN})
    public Result<Page<OperationLog>> getLogPage(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String module,
            @RequestParam(required = false) String type) {
        Page<OperationLog> result = logService.getLogPage(page, size, userId, module, type);
        return Result.success(result);
    }
}
