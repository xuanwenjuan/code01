package com.firecontrol.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.firecontrol.annotation.OperationLog;
import com.firecontrol.annotation.RequireRole;
import com.firecontrol.common.PageQuery;
import com.firecontrol.common.Result;
import com.firecontrol.common.constant.UserConstants;
import com.firecontrol.entity.ProductionCost;
import com.firecontrol.service.ProductionCostService;
import com.firecontrol.vo.CostAnalysisVO;
import com.firecontrol.vo.CostStatisticsVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@Tag(name = "生产成本管理", description = "安全生产成本统计分析接口")
@RestController
@RequestMapping("/production-cost")
@RequireRole(anyRole = {UserConstants.ROLE_ADMIN, UserConstants.ROLE_PRODUCTION})
public class ProductionCostController {

    @Resource
    private ProductionCostService productionCostService;

    @Operation(summary = "核算工单成本")
    @OperationLog(module = "生产成本", operation = "核算成本", description = "核算工单生产成本")
    @PostMapping("/calculate/{workOrderId}")
    public Result<Void> calculateWorkOrderCost(@PathVariable Long workOrderId) {
        productionCostService.calculateWorkOrderCost(workOrderId);
        return Result.success();
    }

    @Operation(summary = "根据ID获取成本详情")
    @GetMapping("/{id}")
    public Result<ProductionCost> getCostById(@PathVariable Long id) {
        return Result.success(productionCostService.getCostById(id));
    }

    @Operation(summary = "分页查询成本列表")
    @PostMapping("/page")
    public Result<IPage<ProductionCost>> getCostPage(@RequestBody ProductionCost cost, PageQuery pageQuery) {
        return Result.success(productionCostService.getCostPage(cost, pageQuery));
    }

    @Operation(summary = "获取成本统计数据")
    @GetMapping("/statistics")
    public Result<CostStatisticsVO> getCostStatistics(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        return Result.success(productionCostService.getCostStatistics(startDate, endDate));
    }

    @Operation(summary = "按日期范围查询成本列表")
    @GetMapping("/date-range")
    public Result<List<ProductionCost>> getCostByDateRange(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        return Result.success(productionCostService.getCostByDateRange(startDate, endDate));
    }

    @Operation(summary = "按工单ID查询成本")
    @GetMapping("/work-order/{workOrderId}")
    public Result<List<ProductionCost>> getCostByWorkOrderId(@PathVariable Long workOrderId) {
        return Result.success(productionCostService.getCostByWorkOrderId(workOrderId));
    }

    @Operation(summary = "导出生成工单用料明细")
    @GetMapping("/export/material/{workOrderId}")
    public ResponseEntity<byte[]> exportWorkOrderMaterialDetail(@PathVariable Long workOrderId) {
        byte[] data = productionCostService.exportWorkOrderMaterialDetail(workOrderId);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", "work_order_material_" + workOrderId + ".xlsx");
        return ResponseEntity.ok().headers(headers).body(data);
    }

    @Operation(summary = "获取成本分析数据")
    @GetMapping("/analysis")
    public Result<CostAnalysisVO> getCostAnalysis(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        return Result.success(productionCostService.getCostAnalysis(startDate, endDate));
    }
}
