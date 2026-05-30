package com.hydraulic.piston.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.hydraulic.piston.common.Result;
import com.hydraulic.piston.entity.OperationLog;
import com.hydraulic.piston.service.OperationLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@Tag(name = "操作日志接口")
@RestController
@RequestMapping("/api/operation-log")
@RequiredArgsConstructor
public class OperationLogController {

    private final OperationLogService logService;

    @Operation(summary = "分页查询操作日志")
    @GetMapping("/page")
    public Result<Page<OperationLog>> getPage(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String module,
            @RequestParam(required = false) Integer status) {
        return Result.success(logService.getPage(pageNum, pageSize, userId, module, status));
    }

    @Operation(summary = "根据ID获取日志详情")
    @GetMapping("/{id}")
    public Result<OperationLog> getById(@PathVariable Long id) {
        return Result.success(logService.getById(id));
    }

    @Operation(summary = "删除日志")
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        logService.delete(id);
        return Result.success();
    }
}
