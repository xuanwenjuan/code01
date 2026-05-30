package com.evparts.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.evparts.annotation.RequireRole;
import com.evparts.common.PageQuery;
import com.evparts.common.PageResult;
import com.evparts.common.Result;
import com.evparts.entity.SysOperationLog;
import com.evparts.mapper.SysOperationLogMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "操作日志管理", description = "查询系统操作日志")
@RestController
@RequestMapping("/operation-log")
@RequireRole("ADMIN")
public class OperationLogController {

    @Autowired
    private SysOperationLogMapper operationLogMapper;

    @Operation(summary = "分页查询操作日志")
    @GetMapping("/page")
    public Result<PageResult<SysOperationLog>> getPage(
            PageQuery pageQuery,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String operation,
            @RequestParam(required = false) Integer status) {
        LambdaQueryWrapper<SysOperationLog> wrapper = new LambdaQueryWrapper<>();
        if (username != null && !username.isEmpty()) {
            wrapper.like(SysOperationLog::getUsername, username);
        }
        if (operation != null && !operation.isEmpty()) {
            wrapper.like(SysOperationLog::getOperation, operation);
        }
        if (status != null) {
            wrapper.eq(SysOperationLog::getStatus, status);
        }
        wrapper.orderByDesc(SysOperationLog::getCreateTime);

        IPage<SysOperationLog> page = operationLogMapper.selectPage(pageQuery.toPage(), wrapper);
        return Result.success(PageResult.of(page));
    }

}
