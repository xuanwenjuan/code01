package com.watchrepair.admin.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.watchrepair.admin.common.PageQuery;
import com.watchrepair.admin.common.Result;
import com.watchrepair.admin.entity.OperationLog;
import com.watchrepair.admin.service.OperationLogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/log")
@RequiredArgsConstructor
public class OperationLogController {

    private final OperationLogService operationLogService;

    @GetMapping("/page")
    @PreAuthorize("hasAnyRole('4')")
    public Result<Page<OperationLog>> getLogPage(
            @Valid PageQuery pageQuery,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String operation) {
        return Result.success(operationLogService.getLogPage(pageQuery, userId, operation));
    }
}