package com.household.management.controller;

import com.household.management.common.annotation.OperationLog;
import com.household.management.common.result.Result;
import com.household.management.entity.ProductCost;
import com.household.management.service.ProductCostService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "单品成本核算")
@RestController
@RequestMapping("/cost/product")
public class ProductCostController {

    private final ProductCostService productCostService;

    public ProductCostController(ProductCostService productCostService) {
        this.productCostService = productCostService;
    }

    @GetMapping("/list")
    @Operation(summary = "获取单品成本列表")
    public Result<List<ProductCost>> list() {
        return Result.success(productCostService.list());
    }

    @GetMapping("/query")
    @Operation(summary = "多条件查询单品成本")
    public Result<List<ProductCost>> listByConditions(
            @RequestParam(required = false) String statisticsMonth,
            @RequestParam(required = false) Long productId) {
        return Result.success(productCostService.listByConditions(statisticsMonth, productId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "获取单品成本详情")
    public Result<ProductCost> getById(@PathVariable Long id) {
        return Result.success(productCostService.getById(id));
    }

    @PostMapping("/calculate/{workOrderId}")
    @Operation(summary = "核算工单产品成本")
    @OperationLog(module = "单品成本核算", operation = "核算产品成本")
    public Result<ProductCost> calculateProductCost(@PathVariable Long workOrderId) {
        return Result.success(productCostService.calculateProductCost(workOrderId));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除产品成本记录")
    @OperationLog(module = "单品成本核算", operation = "删除成本记录")
    public Result<Void> delete(@PathVariable Long id) {
        productCostService.delete(id);
        return Result.success();
    }
}
