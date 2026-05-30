package com.amber.customize.controller;

import com.amber.customize.annotation.RequireRole;
import com.amber.customize.common.Result;
import com.amber.customize.entity.OperationLog;
import com.amber.customize.service.OperationLogService;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/operation-log")
@RequiredArgsConstructor
public class OperationLogController {

    private final OperationLogService operationLogService;

    @GetMapping("/page")
    @RequireRole({4})
    public Result<Page<OperationLog>> page(@RequestParam(defaultValue = "1") int page,
                                           @RequestParam(defaultValue = "10") int size,
                                           @RequestParam(required = false) String module) {
        return Result.success(operationLogService.page(page, size, module));
    }

}