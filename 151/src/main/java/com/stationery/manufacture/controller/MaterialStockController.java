package com.stationery.manufacture.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.stationery.manufacture.common.RequireRole;
import com.stationery.manufacture.common.Result;
import com.stationery.manufacture.dto.MaterialQueryDTO;
import com.stationery.manufacture.entity.MaterialStock;
import com.stationery.manufacture.service.MaterialStockService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/material")
@Tag(name = "原料库存管理")
@RequireRole({"PURCHASER", "ADMIN", "PRODUCTION_LEADER"})
public class MaterialStockController {

    private final MaterialStockService stockService;

    public MaterialStockController(MaterialStockService stockService) {
        this.stockService = stockService;
    }

    @PostMapping
    @Operation(summary = "新增原料库存")
    public Result<Void> add(@Valid @RequestBody MaterialStock stock) {
        stockService.addStock(stock);
        return Result.success();
    }

    @PutMapping
    @Operation(summary = "修改原料库存")
    public Result<Void> update(@Valid @RequestBody MaterialStock stock) {
        stockService.updateStock(stock);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除原料库存")
    public Result<Void> delete(@PathVariable Long id) {
        stockService.deleteStock(id);
        return Result.success();
    }

    @GetMapping("/{id}")
    @Operation(summary = "获取原料详情")
    public Result<MaterialStock> getById(@PathVariable Long id) {
        return Result.success(stockService.getStockById(id));
    }

    @GetMapping("/page")
    @Operation(summary = "分页查询原料列表")
    public Result<Page<MaterialStock>> getPage(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String materialType,
            @RequestParam(required = false) String materialName,
            @RequestParam(required = false) Integer stockStatus,
            @RequestParam(required = false) Integer purchaseStatus) {
        return Result.success(stockService.getStockPage(pageNum, pageSize,
                materialType, materialName, stockStatus, purchaseStatus));
    }

    @PutMapping("/{id}/quantity")
    @Operation(summary = "调整库存数量")
    public Result<Void> updateQuantity(
            @PathVariable Long id,
            @RequestParam BigDecimal quantity,
            @RequestParam String type) {
        stockService.updateStockQuantity(id, quantity, type);
        return Result.success();
    }

    @GetMapping("/warning")
    @Operation(summary = "获取库存预警列表")
    public Result<List<MaterialStock>> getWarningList() {
        return Result.success(stockService.getWarningList());
    }

    @GetMapping("/moisture")
    @Operation(summary = "获取防潮原料列表")
    public Result<List<MaterialStock>> getMoistureList() {
        return Result.success(stockService.getMoistureList());
    }

    @PutMapping("/{id}/purchase-status")
    @Operation(summary = "更新采购状态")
    public Result<Void> updatePurchaseStatus(@PathVariable Long id, @RequestParam Integer status) {
        stockService.updatePurchaseStatus(id, status);
        return Result.success();
    }

    @PostMapping("/query")
    @Operation(summary = "多条件组合查询原料")
    public Result<Page<MaterialStock>> queryMaterials(@Valid @RequestBody MaterialQueryDTO dto) {
        return Result.success(stockService.queryMaterials(dto));
    }
}
