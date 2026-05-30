package com.evparts.controller;

import com.evparts.annotation.OperationLog;
import com.evparts.annotation.RequireRole;
import com.evparts.common.PageResult;
import com.evparts.common.Result;
import com.evparts.dto.*;
import com.evparts.entity.Material;
import com.evparts.entity.MaterialStock;
import com.evparts.service.MaterialService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "原料管理", description = "原料档案、库存管理、领料退料、库存调拨")
@RestController
@RequestMapping("/material")
public class MaterialController {

    @Autowired
    private MaterialService materialService;

    @Operation(summary = "分页查询原料")
    @GetMapping("/page")
    public Result<PageResult<Material>> getPage(MaterialQueryDTO queryDTO) {
        return Result.success(materialService.getPage(queryDTO));
    }

    @Operation(summary = "获取原料列表")
    @GetMapping("/list")
    public Result<List<Material>> getList() {
        return Result.success(materialService.getList());
    }

    @Operation(summary = "获取原料详情")
    @GetMapping("/{id}")
    public Result<Material> getById(@PathVariable Long id) {
        return Result.success(materialService.getById(id));
    }

    @Operation(summary = "新增原料")
    @OperationLog(operation = "新增原料档案")
    @RequireRole({"PURCHASE", "ADMIN"})
    @PostMapping
    public Result<Void> add(@Valid @RequestBody MaterialDTO dto) {
        materialService.add(dto);
        return Result.success();
    }

    @Operation(summary = "修改原料")
    @OperationLog(operation = "修改原料档案")
    @RequireRole({"PURCHASE", "ADMIN"})
    @PutMapping
    public Result<Void> update(@Valid @RequestBody MaterialDTO dto) {
        materialService.update(dto);
        return Result.success();
    }

    @Operation(summary = "更新原料状态")
    @OperationLog(operation = "更新原料状态")
    @RequireRole({"PURCHASE", "ADMIN"})
    @PutMapping("/{id}/status")
    public Result<Void> updateStatus(@PathVariable Long id, @RequestParam Integer status) {
        materialService.updateStatus(id, status);
        return Result.success();
    }

    @Operation(summary = "删除原料")
    @OperationLog(operation = "删除原料档案")
    @RequireRole({"PURCHASE", "ADMIN"})
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        materialService.delete(id);
        return Result.success();
    }

    @Operation(summary = "原料入库")
    @OperationLog(operation = "原料入库")
    @RequireRole({"PURCHASE", "ADMIN"})
    @PostMapping("/stock-in")
    public Result<Void> stockIn(@Valid @RequestBody MaterialStockInDTO dto) {
        materialService.stockIn(dto);
        return Result.success();
    }

    @Operation(summary = "原料出库（工单领料）")
    @OperationLog(operation = "原料出库")
    @RequireRole({"PRODUCTION", "ADMIN", "PURCHASE"})
    @PostMapping("/stock-out")
    public Result<Void> stockOut(@Valid @RequestBody MaterialStockOutDTO dto) {
        materialService.stockOut(dto);
        return Result.success();
    }

    @Operation(summary = "原料退库")
    @OperationLog(operation = "原料退库")
    @RequireRole({"PRODUCTION", "ADMIN", "PURCHASE"})
    @PostMapping("/stock-return")
    public Result<Void> stockReturn(@Valid @RequestBody MaterialStockReturnDTO dto) {
        materialService.stockReturn(dto);
        return Result.success();
    }

    @Operation(summary = "库存调拨")
    @OperationLog(operation = "库存调拨")
    @RequireRole({"PURCHASE", "ADMIN"})
    @PostMapping("/stock-transfer")
    public Result<Void> stockTransfer(@Valid @RequestBody MaterialStockTransferDTO dto) {
        materialService.stockTransfer(dto);
        return Result.success();
    }

    @Operation(summary = "分页查询库存详情")
    @GetMapping("/stock/detail-page")
    public Result<PageResult<MaterialStock>> getStockDetailPage(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String materialName,
            @RequestParam(required = false) String materialCode,
            @RequestParam(required = false) String materialType,
            @RequestParam(required = false) Integer stockStatus,
            @RequestParam(required = false) String warehouse,
            @RequestParam(required = false) Boolean moistureWarning) {
        return Result.success(materialService.getStockDetailPage(
                pageNum, pageSize, materialName, materialCode, materialType, stockStatus, warehouse, moistureWarning
        ));
    }

    @Operation(summary = "获取原料可用库存列表")
    @GetMapping("/{id}/available-stock")
    public Result<List<MaterialStock>> getAvailableStock(@PathVariable Long id) {
        return Result.success(materialService.getAvailableStock(id));
    }

    @Operation(summary = "获取防潮提醒列表")
    @GetMapping("/moisture-warning")
    public Result<List<MaterialStock>> getMoistureWarningList() {
        return Result.success(materialService.getMoistureWarningList());
    }

    @Operation(summary = "更新防潮检查时间")
    @OperationLog(operation = "更新防潮检查时间")
    @RequireRole({"PURCHASE", "ADMIN"})
    @PutMapping("/stock/{id}/moisture-check")
    public Result<Void> updateMoistureCheckTime(@PathVariable Long id) {
        materialService.updateMoistureCheckTime(id);
        return Result.success();
    }

    @Operation(summary = "获取库存汇总统计")
    @GetMapping("/stock/summary")
    public Result<List<Map<String, Object>>> getStockSummary() {
        return Result.success(materialService.getStockSummary());
    }

}
