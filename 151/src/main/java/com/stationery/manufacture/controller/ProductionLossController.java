package com.stationery.manufacture.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.stationery.manufacture.common.RequireRole;
import com.stationery.manufacture.common.Result;
import com.stationery.manufacture.entity.ProductionLoss;
import com.stationery.manufacture.service.ProductionLossService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/production/loss")
@Tag(name = "生产损耗管理")
@RequireRole({"PRODUCTION_LEADER", "ADMIN", "INSPECTOR"})
public class ProductionLossController {

    private final ProductionLossService lossService;

    public ProductionLossController(ProductionLossService lossService) {
        this.lossService = lossService;
    }

    @PostMapping
    @Operation(summary = "记录生产损耗")
    public Result<Void> recordLoss(@Valid @RequestBody ProductionLoss loss) {
        lossService.recordLoss(loss);
        return Result.success();
    }

    @PutMapping
    @Operation(summary = "修改损耗记录")
    @RequireRole({"PRODUCTION_LEADER", "ADMIN"})
    public Result<Void> updateLoss(@Valid @RequestBody ProductionLoss loss) {
        lossService.updateLoss(loss);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除损耗记录")
    @RequireRole({"ADMIN"})
    public Result<Void> deleteLoss(@PathVariable Long id) {
        lossService.deleteLoss(id);
        return Result.success();
    }

    @GetMapping("/{id}")
    @Operation(summary = "获取损耗详情")
    public Result<ProductionLoss> getById(@PathVariable Long id) {
        return Result.success(lossService.getLossById(id));
    }

    @GetMapping("/page")
    @Operation(summary = "分页查询损耗记录")
    public Result<Page<ProductionLoss>> getPage(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Long orderId,
            @RequestParam(required = false) String lossType,
            @RequestParam(required = false) Long materialId,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startTime,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endTime) {
        return Result.success(lossService.getLossPage(pageNum, pageSize, orderId, lossType, materialId, startTime, endTime));
    }

    @GetMapping("/order/{orderId}")
    @Operation(summary = "工单损耗列表")
    public Result<List<ProductionLoss>> getLossByOrder(@PathVariable Long orderId) {
        return Result.success(lossService.getLossByOrder(orderId));
    }

    @GetMapping("/statistics")
    @Operation(summary = "损耗统计分析")
    public Result<List<Map<String, Object>>> getLossStatistics(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startTime,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endTime) {
        return Result.success(lossService.getLossStatistics(startTime, endTime));
    }
}
