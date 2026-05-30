package com.cosmetics.controller;

import com.cosmetics.annotation.RequireRole;
import com.cosmetics.common.Result;
import com.cosmetics.entity.CostStatistics;
import com.cosmetics.enums.UserRoleEnum;
import com.cosmetics.service.CostStatisticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Tag(name = "成本统计管理")
@RestController
@RequestMapping("/cost-statistics")
@RequiredArgsConstructor
public class CostStatisticsController {

    private final CostStatisticsService costStatisticsService;

    @Operation(summary = "获取工单成本详情")
    @GetMapping("/work-order/{workOrderId}")
    @RequireRole({UserRoleEnum.PRODUCTION_LEADER, UserRoleEnum.FORMULA_DEVELOPER})
    public Result<CostStatistics> getByWorkOrderId(@PathVariable Long workOrderId) {
        return Result.success(costStatisticsService.getByWorkOrderId(workOrderId));
    }

    @Operation(summary = "获取工单成本明细（含用料明细）")
    @GetMapping("/detail/{workOrderId}")
    @RequireRole({UserRoleEnum.PRODUCTION_LEADER, UserRoleEnum.FORMULA_DEVELOPER})
    public Result<Map<String, Object>> getCostDetail(@PathVariable Long workOrderId) {
        return Result.success(costStatisticsService.getCostDetail(workOrderId));
    }

    @Operation(summary = "按日期范围查询成本统计")
    @GetMapping("/date-range")
    @RequireRole({UserRoleEnum.PRODUCTION_LEADER, UserRoleEnum.FORMULA_DEVELOPER})
    public Result<List<CostStatistics>> getByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return Result.success(costStatisticsService.getByDateRange(startDate, endDate));
    }

    @Operation(summary = "获取成本汇总统计")
    @GetMapping("/summary")
    @RequireRole({UserRoleEnum.PRODUCTION_LEADER, UserRoleEnum.FORMULA_DEVELOPER})
    public Result<Map<String, Object>> getCostSummary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return Result.success(costStatisticsService.getCostSummary(startDate, endDate));
    }

    @Operation(summary = "获取成本趋势分析")
    @GetMapping("/trend")
    @RequireRole({UserRoleEnum.PRODUCTION_LEADER, UserRoleEnum.FORMULA_DEVELOPER})
    public Result<Map<String, Object>> getCostTrend(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return Result.success(costStatisticsService.getCostTrend(startDate, endDate));
    }

    @Operation(summary = "按产品维度统计成本")
    @GetMapping("/by-product")
    @RequireRole({UserRoleEnum.PRODUCTION_LEADER, UserRoleEnum.FORMULA_DEVELOPER})
    public Result<Map<String, Object>> getCostByProduct(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return Result.success(costStatisticsService.getCostByProduct(startDate, endDate));
    }

    @Operation(summary = "更新成本信息")
    @PutMapping("/{id}")
    @RequireRole({UserRoleEnum.PRODUCTION_LEADER})
    public Result<Void> updateCost(@PathVariable Long id, @RequestBody CostStatistics cost) {
        costStatisticsService.updateCost(id, cost);
        return Result.success();
    }

    @Operation(summary = "更新分项成本")
    @PutMapping("/{id}/update-cost-items")
    @RequireRole({UserRoleEnum.PRODUCTION_LEADER})
    public Result<Void> updateCostItems(@PathVariable Long id, @RequestBody com.cosmetics.dto.CostUpdateDTO costUpdateDTO) {
        CostStatistics cost = costStatisticsService.getById(id);
        if (cost == null) {
            return Result.error("成本记录不存在");
        }
        if (costUpdateDTO.getPackagingCost() != null) {
            cost.setPackagingCost(costUpdateDTO.getPackagingCost());
        }
        if (costUpdateDTO.getEnergyCost() != null) {
            cost.setEnergyCost(costUpdateDTO.getEnergyCost());
        }
        if (costUpdateDTO.getLaborCost() != null) {
            cost.setLaborCost(costUpdateDTO.getLaborCost());
        }
        if (costUpdateDTO.getScrapCost() != null) {
            cost.setScrapCost(costUpdateDTO.getScrapCost());
        }
        costStatisticsService.updateCost(id, cost);
        return Result.success();
    }

    @Operation(summary = "重新计算工单成本")
    @PostMapping("/recalculate/{workOrderId}")
    @RequireRole({UserRoleEnum.PRODUCTION_LEADER})
    public Result<Void> recalculateCost(@PathVariable Long workOrderId) {
        costStatisticsService.recalculateCost(workOrderId);
        return Result.success();
    }
}
