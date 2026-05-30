package com.plastic.injection.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.plastic.injection.annotation.RequirePermission;
import com.plastic.injection.common.Result;
import com.plastic.injection.dto.CostStatisticsDTO;
import com.plastic.injection.enums.PermissionType;
import com.plastic.injection.service.CostAccountingService;
import com.plastic.injection.vo.CostAccountingVO;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cost-accounting")
@RequiredArgsConstructor
public class CostAccountingController {

    private final CostAccountingService costAccountingService;

    @PostMapping("/generate")
    @RequirePermission(PermissionType.COST_MANAGE)
    public Result<Long> generate(
            @RequestParam Long orderId,
            @RequestParam(required = false) BigDecimal machineCostPerHour,
            @RequestParam(required = false) BigDecimal laborCostPerHour,
            @RequestParam(required = false) BigDecimal energyCostPerHour,
            @RequestParam(required = false) BigDecimal maintenanceCost,
            @RequestParam(required = false) BigDecimal otherCost) {
        return Result.success(costAccountingService.generateCostAccounting(
                orderId, machineCostPerHour, laborCostPerHour,
                energyCostPerHour, maintenanceCost, otherCost));
    }

    @GetMapping("/page")
    @RequirePermission(PermissionType.COST_VIEW)
    public Result<Page<CostAccountingVO>> page(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        return Result.success(costAccountingService.pageQuery(pageNum, pageSize, categoryId, startDate, endDate));
    }

    @GetMapping("/{id}")
    public Result<CostAccountingVO> getById(@PathVariable Long id) {
        return Result.success(costAccountingService.getById(id));
    }

    @GetMapping("/statistics")
    @RequirePermission(PermissionType.COST_VIEW)
    public Result<CostStatisticsDTO> getStatistics(
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        return Result.success(costAccountingService.getStatistics(startDate, endDate));
    }

    @GetMapping("/trend")
    @RequirePermission(PermissionType.COST_VIEW)
    public Result<List<Map<String, Object>>> getCostTrend(
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        return Result.success(costAccountingService.getCostTrend(startDate, endDate));
    }

    @DeleteMapping("/{id}")
    @RequirePermission(PermissionType.COST_MANAGE)
    public Result<Void> delete(@PathVariable Long id) {
        costAccountingService.deleteById(id);
        return Result.success();
    }
}
