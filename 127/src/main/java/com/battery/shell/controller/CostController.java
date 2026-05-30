package com.battery.shell.controller;

import com.battery.shell.annotation.RequireRole;
import com.battery.shell.common.Result;
import com.battery.shell.constant.RoleConstant;
import com.battery.shell.entity.CostDetail;
import com.battery.shell.entity.CostStatistics;
import com.battery.shell.service.CostService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/cost")
@RequiredArgsConstructor
public class CostController {

    private final CostService costService;

    @PostMapping("/generate")
    @RequireRole({RoleConstant.ADMIN})
    public Result<Void> generateMonthlyReport(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date) {
        costService.generateMonthlyReport(date);
        return Result.success("报表生成成功", null);
    }

    @GetMapping("/report")
    public Result<List<CostStatistics>> getMonthlyReport(
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate,
            @RequestParam(required = false) Long categoryId) {
        return Result.success(costService.getMonthlyReport(startDate, endDate, categoryId));
    }

    @GetMapping("/{costId}/details")
    public Result<List<CostDetail>> getCostDetails(@PathVariable Long costId) {
        return Result.success(costService.getCostDetails(costId));
    }

    @GetMapping("/order/{orderId}")
    public Result<CostDetail> getOrderCostDetail(@PathVariable Long orderId) {
        CostDetail detail = costService.getOrderCostDetail(orderId);
        if (detail == null) {
            return Result.error("工单不存在");
        }
        return Result.success(detail);
    }

    @DeleteMapping("/{id}")
    @RequireRole({RoleConstant.ADMIN})
    public Result<Void> deleteCostReport(@PathVariable Long id) {
        costService.deleteCostReport(id);
        return Result.success("删除成功", null);
    }
}
