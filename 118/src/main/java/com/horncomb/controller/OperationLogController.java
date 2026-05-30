package com.horncomb.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.horncomb.annotation.RequireRole;
import com.horncomb.common.Constants;
import com.horncomb.common.Result;
import com.horncomb.entity.OperationLogEntity;
import com.horncomb.mapper.OperationLogMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/log")
@RequiredArgsConstructor
public class OperationLogController {

    private final OperationLogMapper operationLogMapper;

    @GetMapping("/page")
    @RequireRole({Constants.ROLE_ADMIN})
    public Result<IPage<OperationLogEntity>> page(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String module,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Long userId
    ) {
        Page<OperationLogEntity> page = new Page<>(pageNum, pageSize);
        IPage<OperationLogEntity> result = operationLogMapper.selectPage(page,
                new LambdaQueryWrapper<OperationLogEntity>()
                        .eq(module != null, OperationLogEntity::getOperationModule, module)
                        .eq(type != null, OperationLogEntity::getOperationType, type)
                        .eq(userId != null, OperationLogEntity::getUserId, userId)
                        .orderByDesc(OperationLogEntity::getCreateTime)
        );
        return Result.success(result);
    }

    @GetMapping("/{id}")
    @RequireRole({Constants.ROLE_ADMIN})
    public Result<OperationLogEntity> getById(@PathVariable Long id) {
        OperationLogEntity log = operationLogMapper.selectById(id);
        return Result.success(log);
    }
}
