package com.woodendoor.production.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.woodendoor.production.annotation.RequireRole;
import com.woodendoor.production.common.Result;
import com.woodendoor.production.entity.CostDetail;
import com.woodendoor.production.entity.ProductionCost;
import com.woodendoor.production.service.ProductionCostService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/production-cost")
@RequiredArgsConstructor
@RequireRole({"leader", "admin"})
public class ProductionCostController {

    private final ProductionCostService productionCostService;

    @PostMapping
    public Result<Void> create(@RequestBody ProductionCost cost) {
        productionCostService.createCost(cost);
        return Result.success();
    }

    @PutMapping
    public Result<Void> update(@RequestBody ProductionCost cost) {
        productionCostService.updateCost(cost);
        return Result.success();
    }

    @GetMapping("/page")
    @RequireRole({"leader", "admin", "purchaser"})
    public Result<Page<ProductionCost>> page(@RequestParam(defaultValue = "1") Integer pageNum,
                                             @RequestParam(defaultValue = "10") Integer pageSize,
                                             @RequestParam(required = false) Long orderId) {
        return Result.success(productionCostService.page(pageNum, pageSize, orderId));
    }

    @GetMapping("/{id}/detail-list")
    @RequireRole({"leader", "admin", "purchaser"})
    public Result<List<CostDetail>> getDetailList(@PathVariable Long id) {
        return Result.success(productionCostService.getDetailList(id));
    }

    @GetMapping("/order/{orderId}")
    @RequireRole({"leader", "admin", "purchaser"})
    public Result<ProductionCost> getByOrderId(@PathVariable Long orderId) {
        return Result.success(productionCostService.getByOrderId(orderId));
    }
}