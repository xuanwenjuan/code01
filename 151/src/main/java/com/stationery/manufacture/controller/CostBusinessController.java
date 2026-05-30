package com.stationery.manufacture.controller;

import com.stationery.manufacture.common.RequireRole;
import com.stationery.manufacture.common.Result;
import com.stationery.manufacture.entity.CostStatistics;
import com.stationery.manufacture.service.CostBusinessService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cost/business")
@Tag(name = "成本业务管理")
@RequireRole({"ADMIN", "PRODUCTION_LEADER"})
public class CostBusinessController {

    private final CostBusinessService costBusinessService;

    public CostBusinessController(CostBusinessService costBusinessService) {
        this.costBusinessService = costBusinessService;
    }

    @PostMapping("/calculate/{orderId}")
    @Operation(summary = "核算工单成本")
    public Result<CostStatistics> calculateOrderCost(@PathVariable Long orderId) {
        return Result.success(costBusinessService.calculateOrderCost(orderId));
    }

    @GetMapping("/summary")
    @Operation(summary = "成本汇总")
    public Result<Map<String, Object>> getCostSummary(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startTime,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endTime) {
        return Result.success(costBusinessService.getCostSummary(startTime, endTime));
    }

    @GetMapping("/category-analysis")
    @Operation(summary = "分类成本分析")
    public Result<List<Map<String, Object>>> getCategoryCostAnalysis(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startTime,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endTime) {
        return Result.success(costBusinessService.getCategoryCostAnalysis(startTime, endTime));
    }

    @GetMapping("/monthly-trend")
    @Operation(summary = "月度成本趋势")
    public Result<List<Map<String, Object>>> getMonthlyTrend(
            @RequestParam(defaultValue = "6") int months) {
        return Result.success(costBusinessService.getMonthlyTrend(months));
    }

    @GetMapping("/{orderId}/structure")
    @Operation(summary = "工单成本结构")
    public Result<Map<String, Object>> getCostStructure(@PathVariable Long orderId) {
        return Result.success(costBusinessService.getCostStructure(orderId));
    }

    @GetMapping("/financial-data")
    @Operation(summary = "财务对接数据")
    @RequireRole({"ADMIN"})
    public Result<List<Map<String, Object>>> getFinancialData(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startTime,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endTime) {
        return Result.success(costBusinessService.getFinancialData(startTime, endTime));
    }

    @GetMapping("/material-usage")
    @Operation(summary = "物料消耗报表")
    public Result<List<Map<String, Object>>> getMaterialUsageReport(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startTime,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endTime) {
        return Result.success(costBusinessService.getMaterialUsageReport(startTime, endTime));
    }

    @GetMapping("/dashboard")
    @Operation(summary = "成本看板")
    public Result<Map<String, Object>> getCostDashboard() {
        return Result.success(costBusinessService.getCostDashboard());
    }
}
