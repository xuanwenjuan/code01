package com.aluminum.extrusion.controller;

import com.aluminum.extrusion.annotation.RequireRole;
import com.aluminum.extrusion.common.Result;
import com.aluminum.extrusion.entity.OperationLog;
import com.aluminum.extrusion.enums.RoleEnum;
import com.aluminum.extrusion.mapper.OperationLogMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/log")
@RequiredArgsConstructor
public class OperationLogController {

    private final OperationLogMapper operationLogMapper;

    @GetMapping("/page")
    @RequireRole({RoleEnum.ADMIN, RoleEnum.QUALITY_INSPECTOR})
    public Result<IPage<OperationLog>> getLogPage(
            @RequestParam(defaultValue = "1") Integer current,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String operationType) {

        LambdaQueryWrapper<OperationLog> wrapper = new LambdaQueryWrapper<>();
        if (operationType != null) {
            wrapper.eq(OperationLog::getOperationType, operationType);
        }
        wrapper.orderByDesc(OperationLog::getCreateTime);

        IPage<OperationLog> page = operationLogMapper.selectPage(new Page<>(current, size), wrapper);
        return Result.success(page);
    }
}
