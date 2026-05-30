package com.textile.production.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.textile.production.annotation.RequiresRole;
import com.textile.production.common.Result;
import com.textile.production.common.RoleConstants;
import com.textile.production.dto.CostDetailDTO;
import com.textile.production.entity.ProductionCost;
import com.textile.production.service.ProductionCostService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/production-cost")
@RequiredArgsConstructor
public class ProductionCostController {

    private final ProductionCostService costService;

    @GetMapping("/order/{orderId}")
    public Result<ProductionCost> getCostByOrderId(@PathVariable Long orderId) {
        return costService.getCostByOrderId(orderId);
    }

    @GetMapping("/page")
    public Result<IPage<ProductionCost>> getCostPage(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Integer settlementStatus,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        return costService.getCostPage(pageNum, pageSize, settlementStatus, startDate, endDate);
    }

    @GetMapping("/summary")
    public Result<Map<String, Object>> getCostSummary(
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        return costService.getCostSummary(startDate, endDate);
    }

    @PutMapping("/update")
    @RequiresRole({RoleConstants.ADMIN, RoleConstants.TECHNICIAN})
    public Result<ProductionCost> updateCost(
            @RequestParam Long orderId,
            @RequestParam(required = false) BigDecimal equipmentCost,
            @RequestParam(required = false) BigDecimal laborCost,
            @RequestParam(required = false) BigDecimal dyeCost,
            @RequestParam(required = false) BigDecimal otherCost,
            @RequestParam(required = false) String remark) {
        return costService.updateCost(orderId, equipmentCost, laborCost, dyeCost, otherCost, remark);
    }

    @PutMapping("/{orderId}/settle")
    @RequiresRole({RoleConstants.ADMIN})
    public Result<Void> settleCost(@PathVariable Long orderId) {
        return costService.settleCost(orderId);
    }

    @PostMapping("/update-detail")
    @RequiresRole({RoleConstants.ADMIN, RoleConstants.TECHNICIAN})
    public Result<ProductionCost> updateCostDetail(@Valid @RequestBody CostDetailDTO dto) {
        return costService.updateCostDetail(dto);
    }

    @GetMapping("/report/detail")
    public Result<List<Map<String, Object>>> getCostDetailReport(
            @RequestParam(required = false) Integer settlementStatus,
            @RequestParam(required = false) LocalDateTime startDate,
            @RequestParam(required = false) LocalDateTime endDate) {
        return costService.getCostDetailReport(settlementStatus, startDate, endDate);
    }

    @GetMapping("/report/analysis")
    public Result<List<Map<String, Object>>> getCostAnalysisReport(
            @RequestParam(required = false) LocalDateTime startDate,
            @RequestParam(required = false) LocalDateTime endDate) {
        return costService.getCostAnalysisReport(startDate, endDate);
    }

    @GetMapping("/report/by-category")
    public Result<List<Map<String, Object>>> getCostByCategory(
            @RequestParam(required = false) LocalDateTime startDate,
            @RequestParam(required = false) LocalDateTime endDate) {
        return costService.getCostByCategory(startDate, endDate);
    }

    @GetMapping("/report/material-trace")
    public Result<List<Map<String, Object>>> getMaterialUsageTrace(
            @RequestParam(required = false) Long orderId,
            @RequestParam(required = false) Long materialId,
            @RequestParam(required = false) LocalDateTime startDate,
            @RequestParam(required = false) LocalDateTime endDate) {
        return costService.getMaterialUsageTrace(orderId, materialId, startDate, endDate);
    }
}
