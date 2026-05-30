package com.paper.production.controller.system;

import com.paper.production.annotation.OperateLog;
import com.paper.production.common.PageQuery;
import com.paper.production.common.PageResult;
import com.paper.production.common.Result;
import com.paper.production.entity.system.OperationLog;
import com.paper.production.service.system.OperationLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "操作日志管理")
@RestController
@RequestMapping("/system/operation-log")
public class OperationLogController {

    @Resource
    private OperationLogService operationLogService;

    @Operation(summary = "分页查询操作日志")
    @PostMapping("/page")
    @OperateLog(module = "系统管理", operation = "查询操作日志", description = "分页查询操作日志")
    public Result<PageResult<OperationLog>> page(@RequestBody PageQuery query) {
        return Result.success(operationLogService.queryLogPage(query));
    }
}
