package com.evparts.controller;

import com.evparts.annotation.OperationLog;
import com.evparts.annotation.RequireRole;
import com.evparts.common.PageResult;
import com.evparts.common.Result;
import com.evparts.dto.ProductionCostDTO;
import com.evparts.entity.ProductionCost;
import com.evparts.service.ProductionCostService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Tag(name = "生产成本管理", description = "成本自动核算、分析、报表、对账")
@RestController
@RequestMapping("/production-cost")
@RequireRole({"PROCESS", "ADMIN"})
public class ProductionCostController {

    @Autowired
    private ProductionCostService productionCostService;

    @Operation(summary = "分页查询成本详情")
    @GetMapping("/detail-page")
    public Result<PageResult<ProductionCost>> getDetailPage(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String costNo,
            @RequestParam(required = false) String orderNo,
            @RequestParam(required = false) String productName,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        return Result.success(productionCostService.getDetailPage(
                pageNum, pageSize, costNo, orderNo, productName, categoryId, status, startDate, endDate
        ));
    }

    @Operation(summary = "分页查询成本记录")
    @GetMapping("/page")
    public Result<PageResult<ProductionCost>> getPage(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String costNo,
            @RequestParam(required = false) Long workOrderId,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        return Result.success(productionCostService.getPage(pageNum, pageSize, costNo, workOrderId, status, startDate, endDate));
    }

    @Operation(summary = "获取成本详情")
    @GetMapping("/{id}")
    public Result<ProductionCost> getById(@PathVariable Long id) {
        return Result.success(productionCostService.getById(id));
    }

    @Operation(summary = "自动核算成本")
    @OperationLog(operation = "自动核算成本")
    @PostMapping("/auto-calculate/{workOrderId}")
    public Result<Long> autoCalculate(@PathVariable Long workOrderId) {
        return Result.success(productionCostService.autoCalculate(workOrderId));
    }

    @Operation(summary = "手动创建成本核算")
    @OperationLog(operation = "手动创建成本核算")
    @PostMapping
    public Result<Long> create(@Valid @RequestBody ProductionCostDTO dto) {
        return Result.success(productionCostService.create(dto));
    }

    @Operation(summary = "确认成本")
    @OperationLog(operation = "确认成本")
    @PutMapping("/{id}/confirm")
    public Result<Void> confirm(@PathVariable Long id) {
        productionCostService.confirm(id);
        return Result.success();
    }

    @Operation(summary = "财务对账")
    @OperationLog(operation = "财务对账")
    @PutMapping("/{id}/reconcile")
    public Result<Void> reconcile(@PathVariable Long id) {
        productionCostService.reconcile(id);
        return Result.success();
    }

    @Operation(summary = "成本趋势分析")
    @GetMapping("/analysis")
    public Result<List<Map<String, Object>>> getCostAnalysis(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) Long productId) {
        return Result.success(productionCostService.getCostAnalysis(startDate, endDate, productId));
    }

    @Operation(summary = "按产品成本统计")
    @GetMapping("/by-product")
    public Result<List<Map<String, Object>>> getCostByProduct(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        return Result.success(productionCostService.getCostByProduct(startDate, endDate));
    }

    @Operation(summary = "成本汇总统计")
    @GetMapping("/summary")
    public Result<Map<String, Object>> getCostSummary(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        return Result.success(productionCostService.getCostSummary(startDate, endDate));
    }

    @Operation(summary = "生成成本报表")
    @GetMapping("/report")
    public Result<List<ProductionCost>> getReport(
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate,
            @RequestParam(required = false) Long productId) {
        return Result.success(productionCostService.getReport(startDate, endDate, productId));
    }

}
