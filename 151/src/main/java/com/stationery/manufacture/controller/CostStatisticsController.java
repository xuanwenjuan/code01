package com.stationery.manufacture.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.stationery.manufacture.common.RequireRole;
import com.stationery.manufacture.common.Result;
import com.stationery.manufacture.entity.CostStatistics;
import com.stationery.manufacture.entity.OrderMaterial;
import com.stationery.manufacture.entity.OrderProcess;
import com.stationery.manufacture.service.CostStatisticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cost")
@Tag(name = "成本统计管理")
@RequireRole({"ADMIN", "PRODUCTION_LEADER"})
public class CostStatisticsController {

    private final CostStatisticsService costService;

    public CostStatisticsController(CostStatisticsService costService) {
        this.costService = costService;
    }

    @PostMapping("/calculate/{orderId}")
    @Operation(summary = "计算工单成本")
    public Result<CostStatistics> calculateOrderCost(@PathVariable Long orderId) {
        return Result.success(costService.calculateOrderCost(orderId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "获取成本详情")
    public Result<CostStatistics> getById(@PathVariable Long id) {
        return Result.success(costService.getCostById(id));
    }

    @GetMapping("/page")
    @Operation(summary = "分页查询成本列表")
    public Result<Page<CostStatistics>> getPage(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String orderNo,
            @RequestParam(required = false) String productName,
            @RequestParam(required = false) String period) {
        return Result.success(costService.getCostPage(pageNum, pageSize, orderNo, productName, period));
    }

    @GetMapping("/report/period")
    @Operation(summary = "期间成本报表")
    public Result<List<Map<String, Object>>> getPeriodCostReport(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startTime,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endTime) {
        return Result.success(costService.getPeriodCostReport(startTime, endTime));
    }

    @GetMapping("/report/category")
    @Operation(summary = "分类成本报表")
    public Result<List<Map<String, Object>>> getCategoryCostReport(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startTime,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endTime) {
        return Result.success(costService.getCategoryCostReport(startTime, endTime));
    }

    @GetMapping("/order/{orderId}/materials")
    @Operation(summary = "获取工单用料明细")
    public Result<List<OrderMaterial>> getOrderMaterials(@PathVariable Long orderId) {
        return Result.success(costService.getOrderMaterials(orderId));
    }

    @GetMapping("/order/{orderId}/processes")
    @Operation(summary = "获取工序列表")
    public Result<List<OrderProcess>> getOrderProcesses(@PathVariable Long orderId) {
        return Result.success(costService.getOrderProcesses(orderId));
    }
}
