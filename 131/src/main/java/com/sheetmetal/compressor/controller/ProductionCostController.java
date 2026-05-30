package com.sheetmetal.compressor.controller;

import com.sheetmetal.compressor.annotation.OperationLog;
import com.sheetmetal.compressor.annotation.RequiresRole;
import com.sheetmetal.compressor.dto.ProductionCostDTO;
import com.sheetmetal.compressor.entity.ProductionCost;
import com.sheetmetal.compressor.enums.UserRole;
import com.sheetmetal.compressor.service.ProductionCostService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import com.sheetmetal.compressor.common.Result;

@RestController
@RequestMapping("/cost")
public class ProductionCostController {

    @Autowired
    private ProductionCostService costService;

    @GetMapping("/list")
    public Result<List<ProductionCost>> list(
            @RequestParam(required = false) String quarter,
            @RequestParam(required = false) Long categoryId
    ) {
        return Result.success(costService.list(quarter, categoryId));
    }

    @GetMapping("/{id}")
    public Result<ProductionCost> getById(@PathVariable Long id) {
        return Result.success(costService.getById(id));
    }

    @PostMapping
    @RequiresRole({UserRole.ADMIN})
    @OperationLog(module = "成本管理", type = "新增", desc = "新增生产成本记录")
    public Result<Void> create(@Valid @RequestBody ProductionCostDTO dto) {
        costService.create(dto);
        return Result.success();
    }

    @PutMapping
    @RequiresRole({UserRole.ADMIN})
    @OperationLog(module = "成本管理", type = "修改", desc = "修改生产成本记录")
    public Result<Void> update(@Valid @RequestBody ProductionCostDTO dto) {
        costService.update(dto);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @RequiresRole({UserRole.ADMIN})
    @OperationLog(module = "成本管理", type = "删除", desc = "删除生产成本记录")
    public Result<Void> delete(@PathVariable Long id) {
        costService.delete(id);
        return Result.success();
    }

    @GetMapping("/quarter-total")
    @RequiresRole({UserRole.ADMIN})
    public Result<BigDecimal> getQuarterTotalCost(@RequestParam String quarter) {
        return Result.success(costService.getQuarterTotalCost(quarter));
    }

    @GetMapping("/category-total")
    @RequiresRole({UserRole.ADMIN})
    public Result<BigDecimal> getCategoryTotalCost(@RequestParam Long categoryId) {
        return Result.success(costService.getCategoryTotalCost(categoryId));
    }
}
