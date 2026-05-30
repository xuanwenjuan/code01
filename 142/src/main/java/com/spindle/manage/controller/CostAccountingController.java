package com.spindle.manage.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.spindle.manage.annotation.RequiresPermission;
import com.spindle.manage.common.Result;
import com.spindle.manage.dto.CostAccountingDTO;
import com.spindle.manage.dto.CostSummaryDTO;
import com.spindle.manage.dto.ProductionLossQueryDTO;
import com.spindle.manage.entity.ProductionLossRecord;
import com.spindle.manage.service.CostAccountingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/cost")
@RequiredArgsConstructor
public class CostAccountingController {

    private final CostAccountingService costAccountingService;

    @RequiresPermission("cost:calculate")
    @GetMapping("/calculate/{orderId}")
    public Result<CostAccountingDTO> calculateOrderCost(@PathVariable Long orderId) {
        CostAccountingDTO result = costAccountingService.calculateOrderCost(orderId);
        return Result.success(result);
    }

    @RequiresPermission("cost:summary")
    @GetMapping("/summary")
    public Result<CostSummaryDTO> getPeriodCostSummary(@RequestParam String startDate,
                                                       @RequestParam String endDate) {
        CostSummaryDTO result = costAccountingService.getPeriodCostSummary(startDate, endDate);
        return Result.success(result);
    }

    @RequiresPermission("cost:category")
    @GetMapping("/category/summary")
    public Result<CostSummaryDTO> getCategoryCostSummary(@RequestParam Long categoryId,
                                                         @RequestParam String startDate,
                                                         @RequestParam String endDate) {
        CostSummaryDTO result = costAccountingService.getCategoryCostSummary(categoryId, startDate, endDate);
        return Result.success(result);
    }

    @RequiresPermission("cost:loss")
    @PostMapping("/loss/list")
    public Result<IPage<ProductionLossRecord>> getLossRecords(@RequestBody ProductionLossQueryDTO dto) {
        Page<ProductionLossRecord> page = new Page<>(dto.getCurrent(), dto.getSize());
        IPage<ProductionLossRecord> result = costAccountingService.getLossRecords(page, dto);
        return Result.success(result);
    }

    @RequiresPermission("cost:loss")
    @GetMapping("/loss/order/{orderId}")
    public Result<List<ProductionLossRecord>> getOrderLossRecords(@PathVariable Long orderId) {
        List<ProductionLossRecord> result = costAccountingService.getOrderLossRecords(orderId);
        return Result.success(result);
    }

    @RequiresPermission("cost:loss")
    @GetMapping("/loss/total/{orderId}")
    public Result<BigDecimal> calculateTotalLossAmount(@PathVariable Long orderId) {
        BigDecimal result = costAccountingService.calculateTotalLossAmount(orderId);
        return Result.success(result);
    }

}
