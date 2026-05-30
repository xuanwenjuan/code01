package com.watchrepair.admin.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.watchrepair.admin.common.PageQuery;
import com.watchrepair.admin.common.Result;
import com.watchrepair.admin.entity.RevenueStatistics;
import com.watchrepair.admin.service.RevenueStatisticsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/statistics")
@RequiredArgsConstructor
public class RevenueStatisticsController {

    private final RevenueStatisticsService statisticsService;

    @GetMapping("/page")
    @PreAuthorize("hasAnyRole('3', '4')")
    public Result<Page<RevenueStatistics>> getStatisticsPage(
            @Valid PageQuery pageQuery,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String statisticsMonth) {
        return Result.success(statisticsService.getStatisticsPage(pageQuery, categoryId, statisticsMonth));
    }

    @GetMapping("/monthly-summary")
    @PreAuthorize("hasAnyRole('3', '4')")
    public Result<Map<String, Object>> getMonthlySummary(@RequestParam String month) {
        return Result.success(statisticsService.getMonthlySummary(month));
    }

    @GetMapping("/date-range-summary")
    @PreAuthorize("hasAnyRole('3', '4')")
    public Result<Map<String, Object>> getDateRangeSummary(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate,
            @RequestParam(required = false) Long categoryId) {
        return Result.success(statisticsService.getDateRangeSummary(startDate, endDate, categoryId));
    }

    @GetMapping("/category-statistics")
    @PreAuthorize("hasAnyRole('3', '4')")
    public Result<List<RevenueStatistics>> getCategoryStatistics(@RequestParam String month) {
        return Result.success(statisticsService.getCategoryStatistics(month));
    }

    @PostMapping("/generate-daily")
    @PreAuthorize("hasAnyRole('4')")
    public Result<Void> generateDailyStatistics(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date) {
        statisticsService.generateDailyStatistics(date);
        return Result.success();
    }
}