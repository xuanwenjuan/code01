package com.snacktrace.controller;

import com.snacktrace.annotation.RequireRole;
import com.snacktrace.common.Result;
import com.snacktrace.entity.ProductionCost;
import com.snacktrace.enums.RoleEnum;
import com.snacktrace.service.ProductionCostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/cost")
public class ProductionCostController {

    @Autowired
    private ProductionCostService costService;

    @GetMapping("/list")
    @RequireRole({RoleEnum.ADMIN})
    public Result<List<ProductionCost>> getCostList(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        List<ProductionCost> list = costService.getCostList(categoryId, startDate, endDate);
        return Result.success(list);
    }

    @GetMapping("/statistics")
    @RequireRole({RoleEnum.ADMIN})
    public Result<Map<String, Object>> getCostStatistics(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        Map<String, Object> statistics = costService.getCostStatistics(categoryId, startDate, endDate);
        return Result.success(statistics);
    }

    @GetMapping("/category/summary")
    @RequireRole({RoleEnum.ADMIN})
    public Result<Map<String, BigDecimal>> getCategoryCostSummary(
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        Map<String, BigDecimal> summary = costService.getCategoryCostSummary(startDate, endDate);
        return Result.success(summary);
    }

    @PutMapping("/breakdown/{costId}")
    @RequireRole({RoleEnum.ADMIN})
    public Result<Void> updateCostBreakdown(
            @PathVariable Long costId,
            @RequestParam(required = false) BigDecimal equipmentCost,
            @RequestParam(required = false) BigDecimal packagingCost,
            @RequestParam(required = false) BigDecimal laborCost,
            @RequestParam(required = false) BigDecimal defectCost) {
        boolean success = costService.updateCostBreakdown(costId, equipmentCost,
                packagingCost, laborCost, defectCost);
        return success ? Result.success("成本更新成功", null) : Result.error("更新失败");
    }
}
