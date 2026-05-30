package com.household.management.controller;

import com.household.management.common.annotation.OperationLog;
import com.household.management.common.result.Result;
import com.household.management.entity.CostStatistics;
import com.household.management.service.CostStatisticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "成本统计管理")
@RestController
@RequestMapping("/cost/statistics")
public class CostStatisticsController {

    private final CostStatisticsService costStatisticsService;

    public CostStatisticsController(CostStatisticsService costStatisticsService) {
        this.costStatisticsService = costStatisticsService;
    }

    @GetMapping("/list")
    @Operation(summary = "获取成本统计列表")
    public Result<List<CostStatistics>> list(@RequestParam(required = false) String startMonth,
                                             @RequestParam(required = false) String endMonth) {
        return Result.success(costStatisticsService.list(startMonth, endMonth));
    }

    @GetMapping("/{id}")
    @Operation(summary = "获取成本统计详情")
    public Result<CostStatistics> getById(@PathVariable Long id) {
        return Result.success(costStatisticsService.getById(id));
    }

    @PostMapping("/generate")
    @Operation(summary = "生成月度成本统计")
    @OperationLog(module = "成本统计管理", operation = "生成月度成本统计")
    public Result<CostStatistics> generateMonthlyStatistics(@RequestParam(required = false) String month) {
        return Result.success(costStatisticsService.generateMonthlyStatistics(month));
    }

    @PostMapping
    @Operation(summary = "新增成本统计记录")
    @OperationLog(module = "成本统计管理", operation = "新增成本统计")
    public Result<Void> add(@Valid @RequestBody CostStatistics statistics) {
        costStatisticsService.addCostRecord(statistics);
        return Result.success();
    }

    @PutMapping
    @Operation(summary = "更新成本统计记录")
    @OperationLog(module = "成本统计管理", operation = "更新成本统计")
    public Result<Void> update(@Valid @RequestBody CostStatistics statistics) {
        costStatisticsService.updateCostRecord(statistics);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除成本统计记录")
    @OperationLog(module = "成本统计管理", operation = "删除成本统计")
    public Result<Void> delete(@PathVariable Long id) {
        costStatisticsService.delete(id);
        return Result.success();
    }
}
