package com.naturaldye.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.naturaldye.annotation.RequiresRole;
import com.naturaldye.common.Result;
import com.naturaldye.entity.CostAccounting;
import com.naturaldye.enums.UserRoleEnum;
import com.naturaldye.service.CostAccountingService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/cost-accounting")
@RequiredArgsConstructor
public class CostAccountingController {

    private final CostAccountingService costAccountingService;

    @PostMapping("/generate")
    @RequiresRole({UserRoleEnum.ADMIN, UserRoleEnum.FABRIC_PURCHASER})
    public Result<Void> generateDailyReport(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date) {
        costAccountingService.generateDailyReport(date);
        return Result.success();
    }

    @GetMapping("/page")
    @RequiresRole({UserRoleEnum.ADMIN, UserRoleEnum.FABRIC_PURCHASER, UserRoleEnum.WORKSHOP_MANAGER})
    public Result<Page<CostAccounting>> getCostReportPage(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        Page<CostAccounting> page = costAccountingService.getCostReportPage(
                pageNum, pageSize, categoryId, startDate, endDate);
        return Result.success(page);
    }

    @GetMapping("/{id}")
    @RequiresRole({UserRoleEnum.ADMIN, UserRoleEnum.FABRIC_PURCHASER})
    public Result<CostAccounting> getCostReportById(@PathVariable Long id) {
        CostAccounting costAccounting = costAccountingService.getCostReportById(id);
        return Result.success(costAccounting);
    }

    @GetMapping("/summary")
    @RequiresRole({UserRoleEnum.ADMIN})
    public Result<List<CostAccounting>> getCostReportSummary(
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        List<CostAccounting> list = costAccountingService.getCostReportSummary(startDate, endDate);
        return Result.success(list);
    }

    @GetMapping("/statistics")
    @RequiresRole({UserRoleEnum.ADMIN})
    public Result<Map<String, Object>> getCostStatistics(
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        Map<String, Object> statistics = costAccountingService.getCostStatistics(startDate, endDate);
        return Result.success(statistics);
    }
}
