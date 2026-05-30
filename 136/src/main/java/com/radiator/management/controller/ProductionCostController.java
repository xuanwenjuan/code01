package com.radiator.management.controller;

import com.radiator.management.annotation.OpLog;
import com.radiator.management.common.Result;
import com.radiator.management.entity.MonthlyReport;
import com.radiator.management.service.ProductionCostService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cost")
@RequiredArgsConstructor
public class ProductionCostController {

    private final ProductionCostService costService;

    @PostMapping("/calculate/{workOrderId}")
    @OpLog(module = "生产成本", operation = "计算工单成本")
    public Result<Void> calculateCost(@PathVariable Long workOrderId) {
        costService.calculateCost(workOrderId);
        return Result.success();
    }

    @PostMapping("/report/{month}")
    @OpLog(module = "生产成本", operation = "生成月度报表")
    public Result<Void> generateMonthlyReport(@PathVariable String month) {
        costService.generateMonthlyReport(month);
        return Result.success();
    }

    @GetMapping("/reports")
    public Result<List<MonthlyReport>> getMonthlyReports() {
        return Result.success(costService.getMonthlyReports());
    }

    @GetMapping("/report/{month}")
    public Result<MonthlyReport> getReportByMonth(@PathVariable String month) {
        return Result.success(costService.getReportByMonth(month));
    }

    @PutMapping("/report/{id}/confirm")
    @OpLog(module = "生产成本", operation = "确认月度报表")
    public Result<Void> confirmReport(@PathVariable Long id) {
        costService.confirmReport(id);
        return Result.success();
    }
}