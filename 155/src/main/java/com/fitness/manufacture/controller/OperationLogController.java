package com.fitness.manufacture.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.fitness.manufacture.common.PageQuery;
import com.fitness.manufacture.common.Result;
import com.fitness.manufacture.entity.OperationLog;
import com.fitness.manufacture.service.OperationLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@Tag(name = "操作日志管理")
@RestController
@RequestMapping("/api/operation-logs")
@RequiredArgsConstructor
public class OperationLogController {

    private final OperationLogService operationLogService;

    @Operation(summary = "获取操作日志分页列表")
    @GetMapping("/page")
    public Result<IPage<OperationLog>> getLogPage(PageQuery query,
                                                  @RequestParam(required = false) String module,
                                                  @RequestParam(required = false) Long userId,
                                                  @RequestParam(required = false) Integer status) {
        return Result.success(operationLogService.getLogPage(query, module, userId, status));
    }

    @Operation(summary = "获取操作日志详情")
    @GetMapping("/{id}")
    public Result<OperationLog> getLogById(@PathVariable Long id) {
        return Result.success(operationLogService.getById(id));
    }
}
