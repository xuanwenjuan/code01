package com.logistics.bigcargo.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.logistics.bigcargo.common.Result;
import com.logistics.bigcargo.dto.AutoCalculateDTO;
import com.logistics.bigcargo.dto.LogisticsCostDTO;
import com.logistics.bigcargo.dto.ReconciliationDTO;
import com.logistics.bigcargo.entity.LogisticsCost;
import com.logistics.bigcargo.entity.MonthlyReport;
import com.logistics.bigcargo.service.LogisticsCostService;
import com.logistics.bigcargo.vo.CostStatisticsVO;
import com.logistics.bigcargo.vo.ReconciliationResultVO;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/logistics-costs")
public class LogisticsCostController {

    @Autowired
    private LogisticsCostService logisticsCostService;

    @PostMapping("/auto-calculate")
    @PreAuthorize("hasRole('WAREHOUSE_ADMIN')")
    public Result<LogisticsCost> autoCalculateCost(@Valid @RequestBody AutoCalculateDTO dto,
                                                   @RequestHeader Long operatorId,
                                                   @RequestHeader String operatorName) {
        return Result.success("自动计费完成", logisticsCostService.autoCalculateCost(dto, operatorId, operatorName));
    }

    @PostMapping
    @PreAuthorize("hasRole('WAREHOUSE_ADMIN')")
    public Result<Void> addCost(@Valid @RequestBody LogisticsCostDTO dto,
                                @RequestHeader Long operatorId,
                                @RequestHeader String operatorName) {
        logisticsCostService.addCost(dto, operatorId, operatorName);
        return Result.success("费用录入成功", null);
    }

    @PutMapping
    @PreAuthorize("hasRole('WAREHOUSE_ADMIN')")
    public Result<Void> updateCost(@Valid @RequestBody LogisticsCostDTO dto,
                                   @RequestHeader Long operatorId,
                                   @RequestHeader String operatorName) {
        logisticsCostService.updateCost(dto, operatorId, operatorName);
        return Result.success("更新成功", null);
    }

    @PostMapping("/reconciliation")
    @PreAuthorize("hasRole('WAREHOUSE_ADMIN')")
    public Result<ReconciliationResultVO> reconciliation(@RequestBody ReconciliationDTO dto) {
        return Result.success(logisticsCostService.reconciliation(dto));
    }

    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('WAREHOUSE_ADMIN', 'DISPATCHER')")
    public Result<List<CostStatisticsVO>> getCostStatistics(
            @RequestParam(required = false) String startMonth,
            @RequestParam(required = false) String endMonth,
            @RequestParam(required = false) Long categoryId) {
        return Result.success(logisticsCostService.getCostStatistics(startMonth, endMonth, categoryId));
    }

    @GetMapping("/export")
    @PreAuthorize("hasRole('WAREHOUSE_ADMIN')")
    public Result<List<LogisticsCost>> getCostsForExport(
            @RequestParam(required = false) String costMonth,
            @RequestParam(required = false) Long categoryId) {
        return Result.success(logisticsCostService.getCostsForExport(costMonth, categoryId));
    }

    @PostMapping("/auto-collect-loss/{orderId}")
    @PreAuthorize("hasRole('WAREHOUSE_ADMIN')")
    public Result<LogisticsCost> autoCollectLoss(@PathVariable Long orderId,
                                                 @RequestHeader Long operatorId,
                                                 @RequestHeader String operatorName) {
        return Result.success("损耗归集完成", logisticsCostService.autoCollectLoss(orderId, operatorId, operatorName));
    }

    @PostMapping("/accurate-calculate/{orderId}")
    @PreAuthorize("hasRole('WAREHOUSE_ADMIN')")
    public Result<LogisticsCost> accurateCalculate(@PathVariable Long orderId,
                                                   @RequestHeader Long operatorId,
                                                   @RequestHeader String operatorName) {
        return Result.success("精准核算完成", logisticsCostService.accurateCalculate(orderId, operatorId, operatorName));
    }

    @PostMapping("/query")
    @PreAuthorize("hasAnyRole('WAREHOUSE_ADMIN', 'DISPATCHER')")
    public Result<Page<LogisticsCost>> queryCostPage(@RequestBody LogisticsCostQueryDTO dto) {
        return Result.success(logisticsCostService.queryCostPage(dto));
    }

    @GetMapping("/{id}")
    public Result<LogisticsCost> getCostById(@PathVariable Long id) {
        return Result.success(logisticsCostService.getCostById(id));
    }

    @GetMapping("/page")
    public Result<Page<LogisticsCost>> getCostPage(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String costMonth,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String orderNo,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        return Result.success(logisticsCostService.getCostPage(pageNum, pageSize, costMonth, categoryId,
                orderNo, startDate, endDate));
    }

    @GetMapping("/month/{costMonth}")
    public Result<List<LogisticsCost>> getCostsByMonth(@PathVariable String costMonth) {
        return Result.success(logisticsCostService.getCostsByMonth(costMonth));
    }

    @PostMapping("/generate-report/{reportMonth}")
    @PreAuthorize("hasRole('WAREHOUSE_ADMIN')")
    public Result<Void> generateMonthlyReport(@PathVariable String reportMonth,
                                              @RequestHeader Long operatorId,
                                              @RequestHeader String operatorName) {
        logisticsCostService.generateMonthlyReport(reportMonth, operatorId, operatorName);
        return Result.success("报表生成成功", null);
    }

    @GetMapping("/reports/page")
    public Result<Page<MonthlyReport>> getMonthlyReportPage(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String reportMonth) {
        return Result.success(logisticsCostService.getMonthlyReportPage(pageNum, pageSize, reportMonth));
    }

    @PutMapping("/reports/{reportId}/confirm")
    @PreAuthorize("hasRole('WAREHOUSE_ADMIN')")
    public Result<Void> confirmReport(@PathVariable Long reportId,
                                      @RequestHeader Long operatorId,
                                      @RequestHeader String operatorName) {
        logisticsCostService.confirmReport(reportId, operatorId, operatorName);
        return Result.success("报表确认成功", null);
    }
}
