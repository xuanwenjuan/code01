package com.mushroom.traceability.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.mushroom.traceability.annotation.RequiresRole;
import com.mushroom.traceability.common.Constants;
import com.mushroom.traceability.common.Result;
import com.mushroom.traceability.entity.SalesStatistics;
import com.mushroom.traceability.service.SalesStatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/statistics")
@RequiredArgsConstructor
public class SalesStatisticsController {

    private final SalesStatisticsService statisticsService;

    @GetMapping
    public Result<List<SalesStatistics>> list(
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        return Result.success(statisticsService.listByDateRange(startDate, endDate));
    }

    @GetMapping("/summary")
    public Result<Map<String, Object>> getSummary(
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        List<SalesStatistics> list = statisticsService.listByDateRange(startDate, endDate);
        
        BigDecimal totalHarvest = list.stream()
            .map(s -> s.getHarvestTotal() != null ? s.getHarvestTotal() : BigDecimal.ZERO)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalLoss = list.stream()
            .map(s -> s.getLossTotal() != null ? s.getLossTotal() : BigDecimal.ZERO)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalLogistics = list.stream()
            .map(s -> s.getLogisticsCost() != null ? s.getLogisticsCost() : BigDecimal.ZERO)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalRevenue = list.stream()
            .map(s -> s.getSalesRevenue() != null ? s.getSalesRevenue() : BigDecimal.ZERO)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalProfit = list.stream()
            .map(s -> s.getNetProfit() != null ? s.getNetProfit() : BigDecimal.ZERO)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalHarvest", totalHarvest);
        summary.put("totalLoss", totalLoss);
        summary.put("totalLogistics", totalLogistics);
        summary.put("totalRevenue", totalRevenue);
        summary.put("totalProfit", totalProfit);
        summary.put("recordCount", list.size());
        
        return Result.success(summary);
    }

    @GetMapping("/category/{categoryId}")
    public Result<List<SalesStatistics>> listByCategory(@PathVariable(required = false) Long categoryId) {
        return Result.success(statisticsService.listByCategory(categoryId));
    }

    @GetMapping("/area/{areaId}")
    public Result<List<SalesStatistics>> listByArea(@PathVariable(required = false) Long areaId) {
        return Result.success(statisticsService.listByArea(areaId));
    }

    @GetMapping("/{id}")
    public Result<SalesStatistics> getById(@PathVariable Long id) {
        return Result.success(statisticsService.getById(id));
    }

    @PostMapping
    @RequiresRole({Constants.ROLE_OPERATOR, Constants.ROLE_ADMIN})
    public Result<Void> create(@RequestBody SalesStatistics statistics) {
        statisticsService.save(statistics);
        return Result.success();
    }

    @PutMapping
    @RequiresRole({Constants.ROLE_OPERATOR, Constants.ROLE_ADMIN})
    public Result<Void> update(@RequestBody SalesStatistics statistics) {
        statisticsService.updateById(statistics);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @RequiresRole({Constants.ROLE_ADMIN})
    public Result<Void> delete(@PathVariable Long id) {
        statisticsService.removeById(id);
        return Result.success();
    }
}