package com.snack.processing.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.snack.processing.common.Result;
import com.snack.processing.dto.statistics.StatisticsQueryDTO;
import com.snack.processing.entity.ProductionStatistics;
import com.snack.processing.service.StatisticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/statistics")
@RequiredArgsConstructor
@Tag(name = "生产统计管理", description = "生产经营数据统计和报表")
public class StatisticsController {

    private final StatisticsService statisticsService;

    @PostMapping("/daily")
    @Operation(summary = "生成日报表")
    public Result<ProductionStatistics> generateDailyStatistics(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date) {
        return statisticsService.generateDailyStatistics(date);
    }

    @PostMapping("/monthly")
    @Operation(summary = "生成月报表")
    public Result<ProductionStatistics> generateMonthlyStatistics(
            @RequestParam Integer year,
            @RequestParam Integer month) {
        return statisticsService.generateMonthlyStatistics(year, month);
    }

    @GetMapping("/page")
    @Operation(summary = "分页查询统计数据")
    public Result<IPage<ProductionStatistics>> getStatisticsPage(StatisticsQueryDTO dto) {
        return statisticsService.getStatisticsPage(dto);
    }

    @GetMapping("/dashboard")
    @Operation(summary = "获取仪表盘数据")
    public Result<Map<String, Object>> getDashboardData() {
        return statisticsService.getDashboardData();
    }

    @GetMapping("/work-order/{workOrderId}/material-detail")
    @Operation(summary = "工单用料明细与财务对账")
    public Result<Map<String, Object>> getWorkOrderMaterialDetail(@PathVariable Long workOrderId) {
        return statisticsService.getWorkOrderMaterialDetail(workOrderId);
    }

    @GetMapping("/cost-analysis")
    @Operation(summary = "成本分析")
    public Result<Map<String, Object>> getCostAnalysis(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        return statisticsService.getCostAnalysis(startDate, endDate);
    }

    @GetMapping("/trend-analysis")
    @Operation(summary = "趋势分析")
    public Result<Map<String, Object>> getTrendAnalysis(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        return statisticsService.getTrendAnalysis(startDate, endDate);
    }

    @GetMapping("/quality-analysis")
    @Operation(summary = "质量分析")
    public Result<Map<String, Object>> getQualityAnalysis(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        return statisticsService.getQualityAnalysis(startDate, endDate);
    }

    @GetMapping("/material-consumption")
    @Operation(summary = "物料消耗分析")
    public Result<Map<String, Object>> getMaterialConsumptionAnalysis(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        return statisticsService.getMaterialConsumptionAnalysis(startDate, endDate);
    }

    @GetMapping("/monthly-comparison")
    @Operation(summary = "月度数据对比")
    public Result<Map<String, Object>> getMonthlyComparison(@RequestParam Integer year) {
        return statisticsService.getMonthlyComparison(year);
    }
}
