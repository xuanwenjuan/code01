package com.cosmetics.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cosmetics.annotation.RequireRole;
import com.cosmetics.common.PageQuery;
import com.cosmetics.common.Result;
import com.cosmetics.entity.FinishedProduct;
import com.cosmetics.entity.FinishedInOutLog;
import com.cosmetics.enums.UserRoleEnum;
import com.cosmetics.service.FinishedProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Tag(name = "成品库存管理")
@RestController
@RequestMapping("/finished-products")
@RequiredArgsConstructor
public class FinishedProductController {

    private final FinishedProductService finishedProductService;

    @Operation(summary = "分页查询成品库存列表")
    @GetMapping("/page")
    public Result<Page<FinishedProduct>> getPage(
            @ModelAttribute PageQuery pageQuery,
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) Integer status) {
        return Result.success(finishedProductService.getPage(pageQuery, productId, status));
    }

    @Operation(summary = "获取成品库存详情")
    @GetMapping("/{id}")
    public Result<FinishedProduct> getById(@PathVariable Long id) {
        return Result.success(finishedProductService.getById(id));
    }

    @Operation(summary = "成品入库")
    @PostMapping("/warehouse-in")
    @RequireRole({UserRoleEnum.WAREHOUSE_ADMIN})
    public Result<Void> warehouseIn(@RequestBody FinishedProduct finishedProduct) {
        finishedProductService.warehouseIn(finishedProduct);
        return Result.success();
    }

    @Operation(summary = "成品出库")
    @PostMapping("/warehouse-out/{id}")
    @RequireRole({UserRoleEnum.WAREHOUSE_ADMIN})
    public Result<Void> warehouseOut(
            @PathVariable Long id,
            @RequestParam BigDecimal quantity,
            @RequestParam(required = false) String orderNo,
            @RequestParam(required = false) String remark) {
        finishedProductService.warehouseOut(id, quantity, orderNo, remark);
        return Result.success();
    }

    @Operation(summary = "获取产品总库存")
    @GetMapping("/stock/{productId}")
    public Result<BigDecimal> getTotalStock(@PathVariable Long productId) {
        return Result.success(finishedProductService.getTotalStock(productId));
    }

    @Operation(summary = "获取库存概览")
    @GetMapping("/stock-summary")
    @RequireRole({UserRoleEnum.WAREHOUSE_ADMIN, UserRoleEnum.PRODUCTION_LEADER})
    public Result<Map<String, Object>> getStockSummary() {
        return Result.success(finishedProductService.getStockSummary());
    }

    @Operation(summary = "获取可用库存列表")
    @GetMapping("/available/{productId}")
    @RequireRole({UserRoleEnum.WAREHOUSE_ADMIN, UserRoleEnum.PRODUCTION_LEADER})
    public Result<List<FinishedProduct>> getAvailableStock(@PathVariable Long productId) {
        return Result.success(finishedProductService.getAvailableStock(productId));
    }

    @Operation(summary = "分页查询出入库日志")
    @GetMapping("/in-out-log/page")
    @RequireRole({UserRoleEnum.WAREHOUSE_ADMIN, UserRoleEnum.PRODUCTION_LEADER})
    public Result<Page<FinishedInOutLog>> getInOutLogPage(
            @ModelAttribute PageQuery pageQuery,
            @RequestParam(required = false) Long finishedProductId,
            @RequestParam(required = false) Integer type) {
        return Result.success(finishedProductService.getInOutLogPage(pageQuery, finishedProductId, type));
    }
}
