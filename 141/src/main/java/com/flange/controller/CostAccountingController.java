package com.flange.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.flange.common.Result;
import com.flange.entity.CostAccounting;
import com.flange.service.CostAccountingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

@Tag(name = "成本核算管理")
@RestController
@RequestMapping("/api/cost")
@RequiredArgsConstructor
public class CostAccountingController {

    private final CostAccountingService costService;

    @Operation(summary = "获取成本列表")
    @GetMapping
    public Result<IPage<CostAccounting>> getCostPage(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long orderId) {
        return Result.success(costService.getCostPage(page, size, status, orderId));
    }

    @Operation(summary = "获取成本详情")
    @GetMapping("/{id}")
    public Result<CostAccounting> getCostById(@PathVariable Long id) {
        return Result.success(costService.getCostById(id));
    }

    @Operation(summary = "根据工单ID获取成本")
    @GetMapping("/order/{orderId}")
    public Result<CostAccounting> getCostByOrderId(@PathVariable Long orderId) {
        return Result.success(costService.getCostByOrderId(orderId));
    }

    @Operation(summary = "费用分摊（刀具/能耗）")
    @PutMapping("/allocate/{orderId}")
    public Result<Void> allocateCost(
            @PathVariable Long orderId,
            @RequestParam(required = false) BigDecimal toolCost,
            @RequestParam(required = false) BigDecimal energyCost,
            @RequestParam(required = false) String remark) {
        costService.allocateCost(orderId, toolCost, energyCost, remark);
        return Result.success();
    }

    @Operation(summary = "确认成本")
    @PutMapping("/confirm/{costId}")
    public Result<Void> confirmCost(@PathVariable Long costId) {
        costService.confirmCost(costId);
        return Result.success();
    }

    @Operation(summary = "生成成本报表")
    @GetMapping("/report")
    public Result<Map<String, Object>> generateCostReport(
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        return Result.success(costService.generateCostReport(startDate, endDate));
    }

    @Operation(summary = "获取损耗统计")
    @GetMapping("/loss-statistics")
    public Result<Map<String, Object>> getLossStatistics(
            @RequestParam(required = false) Long orderId,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        return Result.success(costService.getLossStatistics(orderId, startDate, endDate));
    }
}
