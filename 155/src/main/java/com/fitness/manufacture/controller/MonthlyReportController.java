package com.fitness.manufacture.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.fitness.manufacture.common.PageQuery;
import com.fitness.manufacture.common.Result;
import com.fitness.manufacture.entity.MonthlyProductionReport;
import com.fitness.manufacture.service.MonthlyProductionReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@Tag(name = "月度生产报表")
@RestController
@RequestMapping("/api/monthly-reports")
@RequiredArgsConstructor
public class MonthlyReportController {

    private final MonthlyProductionReportService monthlyProductionReportService;

    @Operation(summary = "生成月度报表")
    @PostMapping("/generate")
    public Result<Void> generateMonthlyReport(@RequestParam String reportMonth) {
        monthlyProductionReportService.generateMonthlyReport(reportMonth);
        return Result.success();
    }

    @Operation(summary = "确认月度报表")
    @PutMapping("/{id}/confirm")
    public Result<Void> confirmMonthlyReport(@PathVariable Long id) {
        monthlyProductionReportService.confirmMonthlyReport(id);
        return Result.success();
    }

    @Operation(summary = "获取月度报表分页列表")
    @GetMapping("/page")
    public Result<IPage<MonthlyProductionReport>> getReportPage(PageQuery query,
                                                                @RequestParam(required = false) String reportMonth,
                                                                @RequestParam(required = false) Integer status) {
        return Result.success(monthlyProductionReportService.getReportPage(query, reportMonth, status));
    }

    @Operation(summary = "获取月度报表详情")
    @GetMapping("/{id}")
    public Result<MonthlyProductionReport> getReportById(@PathVariable Long id) {
        return Result.success(monthlyProductionReportService.getById(id));
    }
}
