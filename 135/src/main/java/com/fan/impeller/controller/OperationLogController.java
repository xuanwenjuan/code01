package com.fan.impeller.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fan.impeller.common.PageQuery;
import com.fan.impeller.common.Result;
import com.fan.impeller.entity.OperationLog;
import com.fan.impeller.mapper.OperationLogMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/operation-log")
@RequiredArgsConstructor
public class OperationLogController {

    private final OperationLogMapper operationLogMapper;

    @GetMapping("/page")
    public Result<Page<OperationLog>> page(PageQuery query) {
        Page<OperationLog> page = new Page<>(query.getPageNum(), query.getPageSize());
        return Result.success(operationLogMapper.selectPage(page, null));
    }

    @GetMapping("/{id}")
    public Result<OperationLog> getById(@PathVariable Long id) {
        return Result.success(operationLogMapper.selectById(id));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        operationLogMapper.deleteById(id);
        return Result.success();
    }
}
