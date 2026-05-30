package com.gearbox.manage.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.gearbox.manage.annotation.RequiresRole;
import com.gearbox.manage.common.Result;
import com.gearbox.manage.dto.CostStatisticsDTO;
import com.gearbox.manage.entity.CostAccounting;
import com.gearbox.manage.service.CostAccountingService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/costAccounting")
@RequiredArgsConstructor
public class CostAccountingController {

    private final CostAccountingService costAccountingService;

    @GetMapping("/page")
    public Result<Page<CostAccounting>> listPage(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String status) {
        return Result.success(costAccountingService.listPage(pageNum, pageSize, status));
    }

    @GetMapping("/{id}")
    public Result<CostAccounting> getById(@PathVariable Long id) {
        return Result.success(costAccountingService.getById(id));
    }

    @GetMapping("/workOrder/{workOrderId}")
    public Result<CostAccounting> getByWorkOrderId(@PathVariable Long workOrderId) {
        return Result.success(costAccountingService.getByWorkOrderId(workOrderId));
    }

    @PostMapping("/calculate/{workOrderId}")
    @RequiresRole({"ADMIN", "PROCESS_ENGINEER"})
    public Result<CostAccounting> calculateCost(@PathVariable Long workOrderId) {
        return Result.success(costAccountingService.calculateCost(workOrderId));
    }

    @PostMapping("/recalculate/{workOrderId}")
    @RequiresRole({"ADMIN", "PROCESS_ENGINEER"})
    public Result<Void> recalculateCost(@PathVariable Long workOrderId) {
        return costAccountingService.recalculateCost(workOrderId) ? Result.success() : Result.error("重新核算失败");
    }

    @GetMapping("/statistics")
    @RequiresRole({"ADMIN", "PROCESS_ENGINEER"})
    public Result<CostStatisticsDTO> getStatistics(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return Result.success(costAccountingService.getCostStatistics(startDate, endDate));
    }
}
