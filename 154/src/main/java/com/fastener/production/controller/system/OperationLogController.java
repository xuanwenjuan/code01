package com.fastener.production.controller.system;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.fastener.production.common.annotation.RequiresPermission;
import com.fastener.production.common.entity.PageQuery;
import com.fastener.production.common.result.Result;
import com.fastener.production.entity.system.OperationLog;
import com.fastener.production.service.system.OperationLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@Tag(name = "操作日志管理", description = "系统操作日志查询接口")
@RestController
@RequestMapping("/system/operation-log")
@RequiredArgsConstructor
public class OperationLogController {

    private final OperationLogService operationLogService;

    @Operation(summary = "分页查询操作日志")
    @GetMapping("/page")
    @RequiresPermission("admin")
    public Result<IPage<OperationLog>> page(PageQuery pageQuery,
                                            @RequestParam(required = false) Integer operationType,
                                            @RequestParam(required = false) String moduleCode,
                                            @RequestParam(required = false) Long operatorId,
                                            @RequestParam(required = false) String startTime,
                                            @RequestParam(required = false) String endTime) {
        return Result.success(operationLogService.page(pageQuery, operationType, moduleCode, operatorId, startTime, endTime));
    }

    @Operation(summary = "获取日志详情")
    @GetMapping("/{id}")
    @RequiresPermission("admin")
    public Result<OperationLog> getById(@PathVariable Long id) {
        return Result.success(operationLogService.getById(id));
    }
}
