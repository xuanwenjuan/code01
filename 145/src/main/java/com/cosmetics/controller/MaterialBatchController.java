package com.cosmetics.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cosmetics.annotation.RequireRole;
import com.cosmetics.common.PageQuery;
import com.cosmetics.common.Result;
import com.cosmetics.dto.MaterialOutDTO;
import com.cosmetics.entity.MaterialBatch;
import com.cosmetics.entity.MaterialInOutLog;
import com.cosmetics.enums.UserRoleEnum;
import com.cosmetics.service.MaterialBatchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Tag(name = "原料批次管理")
@RestController
@RequestMapping("/material-batches")
@RequiredArgsConstructor
public class MaterialBatchController {

    private final MaterialBatchService batchService;

    @Operation(summary = "分页查询原料批次列表")
    @GetMapping("/page")
    public Result<Page<MaterialBatch>> getPage(
            @ModelAttribute PageQuery pageQuery,
            @RequestParam(required = false) Long materialId,
            @RequestParam(required = false) Integer isExpired) {
        return Result.success(batchService.getPage(pageQuery, materialId, isExpired));
    }

    @Operation(summary = "获取原料批次详情")
    @GetMapping("/{id}")
    public Result<MaterialBatch> getById(@PathVariable Long id) {
        return Result.success(batchService.getById(id));
    }

    @Operation(summary = "生成批次号")
    @GetMapping("/generate-batch-no")
    @RequireRole({UserRoleEnum.MATERIAL_PURCHASER, UserRoleEnum.WAREHOUSE_ADMIN})
    public Result<String> generateBatchNo(@RequestParam Long materialId) {
        return Result.success(batchService.generateBatchNo(materialId));
    }

    @Operation(summary = "原料入库")
    @PostMapping("/warehouse-in")
    @RequireRole({UserRoleEnum.MATERIAL_PURCHASER, UserRoleEnum.WAREHOUSE_ADMIN})
    public Result<Void> warehouseIn(@RequestBody MaterialBatch batch) {
        batchService.warehouseIn(batch);
        return Result.success();
    }

    @Operation(summary = "原料出库")
    @PostMapping("/warehouse-out")
    @RequireRole({UserRoleEnum.WAREHOUSE_ADMIN, UserRoleEnum.PRODUCTION_LEADER})
    public Result<Void> warehouseOut(@Valid @RequestBody MaterialOutDTO outDTO) {
        batchService.warehouseOut(outDTO);
        return Result.success();
    }

    @Operation(summary = "批量原料出库")
    @PostMapping("/batch-warehouse-out")
    @RequireRole({UserRoleEnum.WAREHOUSE_ADMIN, UserRoleEnum.PRODUCTION_LEADER})
    public Result<Void> batchWarehouseOut(@Valid @RequestBody List<MaterialOutDTO> outDTOList) {
        batchService.batchWarehouseOut(outDTOList);
        return Result.success();
    }

    @Operation(summary = "获取原料总库存")
    @GetMapping("/stock/{materialId}")
    public Result<BigDecimal> getTotalStock(@PathVariable Long materialId) {
        return Result.success(batchService.getTotalStock(materialId));
    }

    @Operation(summary = "获取库存概览")
    @GetMapping("/stock-summary")
    @RequireRole({UserRoleEnum.MATERIAL_PURCHASER, UserRoleEnum.WAREHOUSE_ADMIN, UserRoleEnum.PRODUCTION_LEADER})
    public Result<Map<String, Object>> getStockSummary() {
        return Result.success(batchService.getStockSummary());
    }

    @Operation(summary = "获取可用批次列表")
    @GetMapping("/available/{materialId}")
    @RequireRole({UserRoleEnum.WAREHOUSE_ADMIN, UserRoleEnum.PRODUCTION_LEADER})
    public Result<List<MaterialBatch>> getAvailableBatches(@PathVariable Long materialId) {
        return Result.success(batchService.getAvailableBatches(materialId));
    }

    @Operation(summary = "分页查询出入库日志")
    @GetMapping("/in-out-log/page")
    @RequireRole({UserRoleEnum.MATERIAL_PURCHASER, UserRoleEnum.WAREHOUSE_ADMIN, UserRoleEnum.PRODUCTION_LEADER})
    public Result<Page<MaterialInOutLog>> getInOutLogPage(
            @ModelAttribute PageQuery pageQuery,
            @RequestParam(required = false) Long materialId,
            @RequestParam(required = false) Integer type) {
        return Result.success(batchService.getInOutLogPage(pageQuery, materialId, type));
    }

    @Operation(summary = "获取即将到期批次")
    @GetMapping("/expiring")
    @RequireRole({UserRoleEnum.MATERIAL_PURCHASER, UserRoleEnum.WAREHOUSE_ADMIN, UserRoleEnum.PRODUCTION_LEADER})
    public Result<List<MaterialBatch>> getExpiringBatches(@RequestParam(defaultValue = "30") Integer days) {
        return Result.success(batchService.getExpiringBatches(days));
    }
}
