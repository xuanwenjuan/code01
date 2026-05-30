package com.motor.core.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.motor.core.annotation.OperationLog;
import com.motor.core.annotation.RequiresRole;
import com.motor.core.common.Result;
import com.motor.core.constants.RoleConstants;
import com.motor.core.entity.po.ProductionCostPO;
import com.motor.core.mapper.ProductionCostMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/cost")
@RequiredArgsConstructor
public class ProductionCostController {
    private final ProductionCostMapper productionCostMapper;

    @GetMapping("/page")
    @OperationLog(module = "成本核算", operation = "分页查询", description = "分页查询生产成本记录")
    public Result<Page<ProductionCostPO>> queryPage(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate) {

        Page<ProductionCostPO> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<ProductionCostPO> wrapper = new LambdaQueryWrapper<>();
        if (categoryId != null) {
            wrapper.eq(ProductionCostPO::getCategoryId, categoryId);
        }
        if (startDate != null) {
            wrapper.ge(ProductionCostPO::getCostDate, startDate);
        }
        if (endDate != null) {
            wrapper.le(ProductionCostPO::getCostDate, endDate);
        }
        wrapper.orderByDesc(ProductionCostPO::getCostDate);

        Page<ProductionCostPO> result = productionCostMapper.selectPage(page, wrapper);
        return Result.success(result);
    }

    @GetMapping("/{id}")
    @OperationLog(module = "成本核算", operation = "查询详情", description = "查询成本记录详情")
    public Result<ProductionCostPO> getById(@PathVariable Long id) {
        return Result.success(productionCostMapper.selectById(id));
    }

    @PostMapping
    @RequiresRole({RoleConstants.PROCESS_ENGINEER, RoleConstants.QUALITY_SUPERVISOR})
    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "成本核算", operation = "新增成本", description = "新增生产成本记录")
    public Result<Void> create(@RequestBody ProductionCostPO cost) {
        cost.setCreateTime(java.time.LocalDateTime.now());
        int rows = productionCostMapper.insert(cost);
        return rows > 0 ? Result.success() : Result.error("创建失败");
    }

    @PutMapping
    @RequiresRole({RoleConstants.PROCESS_ENGINEER, RoleConstants.QUALITY_SUPERVISOR})
    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "成本核算", operation = "更新成本", description = "更新生产成本记录")
    public Result<Void> update(@RequestBody ProductionCostPO cost) {
        cost.setUpdateTime(java.time.LocalDateTime.now());
        int rows = productionCostMapper.updateById(cost);
        return rows > 0 ? Result.success() : Result.error("更新失败");
    }

    @DeleteMapping("/{id}")
    @RequiresRole({RoleConstants.PROCESS_ENGINEER})
    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "成本核算", operation = "删除成本", description = "删除生产成本记录")
    public Result<Void> delete(@PathVariable Long id) {
        int rows = productionCostMapper.deleteById(id);
        return rows > 0 ? Result.success() : Result.error("删除失败");
    }
}
