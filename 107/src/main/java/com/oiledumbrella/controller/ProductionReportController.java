package com.oiledumbrella.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.oiledumbrella.annotation.RequiresRole;
import com.oiledumbrella.common.Result;
import com.oiledumbrella.entity.ProductionReport;
import com.oiledumbrella.service.ProductionReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/report")
@RequiredArgsConstructor
public class ProductionReportController {

    private final ProductionReportService reportService;

    @GetMapping("/page")
    @RequiresRole({"ADMIN", "FINANCE"})
    public Result<Page<ProductionReport>> page(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Long styleId,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        Page<ProductionReport> page = reportService.page(pageNum, pageSize, styleId, startDate, endDate);
        return Result.success(page);
    }

    @PostMapping("/generate-daily")
    @RequiresRole({"ADMIN", "FINANCE"})
    public Result<Void> generateDailyReport(@RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date) {
        reportService.generateDailyReport(date);
        return Result.success("报表生成成功", null);
    }

    @GetMapping("/monthly-summary")
    @RequiresRole({"ADMIN", "FINANCE"})
    public Result<Map<String, Object>> getMonthlySummary(
            @RequestParam int year,
            @RequestParam int month) {
        Map<String, Object> summary = reportService.getMonthlySummary(year, month);
        return Result.success(summary);
    }

    @GetMapping("/style-ranking")
    @RequiresRole({"ADMIN", "FINANCE"})
    public Result<List<ProductionReport>> getStyleRanking(
            @RequestParam int year,
            @RequestParam int month,
            @RequestParam(defaultValue = "10") int limit) {
        List<ProductionReport> ranking = reportService.getStyleRanking(year, month, limit);
        return Result.success(ranking);
    }
}
