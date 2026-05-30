package com.household.management.controller;

import com.household.management.common.result.Result;
import com.household.management.service.StatisticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@Tag(name = "统计报表")
@RestController
@RequestMapping("/statistics")
public class StatisticsController {

    private final StatisticsService statisticsService;

    public StatisticsController(StatisticsService statisticsService) {
        this.statisticsService = statisticsService;
    }

    @GetMapping("/dashboard")
    @Operation(summary = "获取首页统计数据")
    public Result<Map<String, Object>> getDashboardStatistics() {
        return Result.success(statisticsService.getDashboardStatistics());
    }

    @GetMapping("/monthly")
    @Operation(summary = "获取月度统计数据")
    public Result<Map<String, Object>> getMonthlyStatistics(@RequestParam(required = false) String month) {
        return Result.success(statisticsService.getMonthlyStatistics(month));
    }
}
