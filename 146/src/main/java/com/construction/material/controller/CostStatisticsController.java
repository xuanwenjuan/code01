package com.construction.material.controller;

import com.construction.material.annotation.OperationLog;
import com.construction.material.annotation.RequiresRole;
import com.construction.material.common.PageQuery;
import com.construction.material.common.PageResult;
import com.construction.material.common.Result;
import com.construction.material.dto.CostReconciliationDTO;
import com.construction.material.dto.CostStatisticsQueryDTO;
import com.construction.material.entity.CostStatistics;
import com.construction.material.service.CostStatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/cost")
@RequiredArgsConstructor
public class CostStatisticsController {

    private final CostStatisticsService costStatisticsService;

    @PostMapping("/generate")
    @RequiresRole({"ADMIN", "FINANCE"})
    @OperationLog(module = "成本统计模块", operation = "生成统计", description = "生成用料成本统计报表")
    public Result<CostStatistics> generateStatistics(
            @RequestParam(required = false) String projectName,
            @RequestParam(defaultValue = "1") Integer statisticsType,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endDate) {
        return Result.success(costStatisticsService.generateStatistics(projectName, statisticsType, startDate, endDate));
    }

    @GetMapping("/{id}")
    @RequiresRole({"ADMIN", "FINANCE", "SUPERVISOR"})
    public Result<CostStatistics> getStatistics(@PathVariable Long id) {
        return Result.success(costStatisticsService.getStatistics(id));
    }

    @GetMapping("/page")
    @RequiresRole({"ADMIN", "FINANCE", "SUPERVISOR"})
    public Result<PageResult<CostStatistics>> getStatisticsPage(
            PageQuery pageQuery,
            CostStatisticsQueryDTO queryDTO) {
        return Result.success(costStatisticsService.getStatisticsPage(pageQuery, queryDTO));
    }

    @DeleteMapping("/{id}")
    @RequiresRole({"ADMIN"})
    @OperationLog(module = "成本统计模块", operation = "删除统计", description = "删除成本统计记录")
    public Result<Void> deleteStatistics(@PathVariable Long id) {
        costStatisticsService.deleteStatistics(id);
        return Result.success();
    }

    @GetMapping("/summary")
    @RequiresRole({"ADMIN", "FINANCE", "SUPERVISOR"})
    public Result<Map<String, Object>> getCostSummary(
            @RequestParam(required = false) String projectName,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endDate) {
        return Result.success(costStatisticsService.getCostSummary(projectName, startDate, endDate));
    }

    @GetMapping("/ranking")
    @RequiresRole({"ADMIN", "FINANCE", "SUPERVISOR"})
    public Result<List<Map<String, Object>>> getMaterialCostRanking(
            @RequestParam(required = false) String projectName,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endDate,
            @RequestParam(defaultValue = "10") int limit) {
        return Result.success(costStatisticsService.getMaterialCostRanking(projectName, startDate, endDate, limit));
    }

    @GetMapping("/category-analysis")
    @RequiresRole({"ADMIN", "FINANCE", "SUPERVISOR"})
    public Result<List<Map<String, Object>>> getCategoryCostAnalysis(
            @RequestParam(required = false) String projectName,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endDate) {
        return Result.success(costStatisticsService.getCategoryCostAnalysis(projectName, startDate, endDate));
    }

    @GetMapping("/trend")
    @RequiresRole({"ADMIN", "FINANCE", "SUPERVISOR"})
    public Result<Map<String, Object>> getCostTrend(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startDate,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endDate) {
        return Result.success(costStatisticsService.getCostTrend(startDate, endDate));
    }

    @PostMapping("/reconciliation")
    @RequiresRole({"ADMIN", "FINANCE"})
    @OperationLog(module = "成本统计模块", operation = "财务对账", description = "项目财务对账")
    public Result<Map<String, Object>> getReconciliation(@RequestBody CostReconciliationDTO dto) {
        return Result.success(costStatisticsService.getReconciliation(dto));
    }

    @GetMapping("/work-order-details")
    @RequiresRole({"ADMIN", "FINANCE", "SUPERVISOR"})
    public Result<List<Map<String, Object>>> getWorkOrderCostDetails(
            @RequestParam(required = false) String projectName,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endDate) {
        return Result.success(costStatisticsService.getWorkOrderCostDetails(projectName, startDate, endDate));
    }

    @GetMapping("/waste-statistics")
    @RequiresRole({"ADMIN", "FINANCE", "SUPERVISOR"})
    public Result<Map<String, Object>> getWasteStatistics(
            @RequestParam(required = false) String projectName,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endDate) {
        return Result.success(costStatisticsService.getWasteStatistics(projectName, startDate, endDate));
    }

    @GetMapping("/waste-details")
    @RequiresRole({"ADMIN", "FINANCE", "SUPERVISOR"})
    public Result<List<Map<String, Object>>> getWasteDetails(
            @RequestParam(required = false) String projectName,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endDate) {
        return Result.success(costStatisticsService.getWasteDetails(projectName, startDate, endDate));
    }
}
