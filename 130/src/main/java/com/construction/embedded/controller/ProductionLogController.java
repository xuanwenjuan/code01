package com.construction.embedded.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.construction.embedded.common.Result;
import com.construction.embedded.entity.ProductionLog;
import com.construction.embedded.mapper.ProductionLogMapper;
import jakarta.validation.constraints.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/log")
public class ProductionLogController {

    @Autowired
    private ProductionLogMapper productionLogMapper;

    @GetMapping
    public Result<IPage<ProductionLog>> list(
            @RequestParam(required = false) Long orderId,
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        LambdaQueryWrapper<ProductionLog> wrapper = new LambdaQueryWrapper<>();
        if (orderId != null) {
            wrapper.eq(ProductionLog::getOrderId, orderId);
        }
        wrapper.orderByDesc(ProductionLog::getOperationTime);
        IPage<ProductionLog> page = productionLogMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
        return Result.success(page);
    }

    @GetMapping("/{id}")
    public Result<ProductionLog> getById(@PathVariable @NotNull(message = "日志ID不能为空") Long id) {
        ProductionLog log = productionLogMapper.selectById(id);
        return Result.success(log);
    }
}
