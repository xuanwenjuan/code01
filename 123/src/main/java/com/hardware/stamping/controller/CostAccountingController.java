package com.hardware.stamping.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.hardware.stamping.annotation.RequiresRole;
import com.hardware.stamping.common.Result;
import com.hardware.stamping.dto.CostAccountingQueryDTO;
import com.hardware.stamping.entity.CostAccounting;
import com.hardware.stamping.service.CostAccountingService;
import com.hardware.stamping.vo.CostAccountingVO;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cost-accounting")
public class CostAccountingController {

    @Autowired
    private CostAccountingService costAccountingService;

    @PostMapping
    @RequiresRole({"ADMIN", "FINANCE"})
    public Result<Void> addCostAccounting(@Valid @RequestBody CostAccounting costAccounting) {
        costAccountingService.addCostAccounting(costAccounting);
        return Result.success();
    }

    @PutMapping
    @RequiresRole({"ADMIN", "FINANCE"})
    public Result<Void> updateCostAccounting(@Valid @RequestBody CostAccounting costAccounting) {
        costAccountingService.updateCostAccounting(costAccounting);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @RequiresRole({"ADMIN"})
    public Result<Void> deleteCostAccounting(@PathVariable Long id) {
        costAccountingService.deleteCostAccounting(id);
        return Result.success();
    }

    @GetMapping("/{id}")
    public Result<CostAccounting> getById(@PathVariable Long id) {
        return Result.success(costAccountingService.getById(id));
    }

    @GetMapping("/list")
    public Result<List<CostAccounting>> listAll() {
        return Result.success(costAccountingService.listAll());
    }

    @PostMapping("/page")
    public Result<IPage<CostAccountingVO>> queryPage(@RequestBody CostAccountingQueryDTO queryDTO) {
        return Result.success(costAccountingService.queryPage(queryDTO));
    }

    @GetMapping("/category/{categoryId}")
    @RequiresRole({"ADMIN", "FINANCE", "FOREMAN"})
    public Result<List<CostAccounting>> listByCategory(@PathVariable Long categoryId) {
        return Result.success(costAccountingService.listByCategory(categoryId));
    }

    @GetMapping("/date-range")
    @RequiresRole({"ADMIN", "FINANCE"})
    public Result<List<CostAccounting>> listByDateRange(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        return Result.success(costAccountingService.listByDateRange(startDate, endDate));
    }

    @GetMapping("/report")
    @RequiresRole({"ADMIN", "FINANCE"})
    public Result<Map<String, Object>> generateCostReport(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        return Result.success(costAccountingService.generateCostReport(startDate, endDate));
    }

    @GetMapping("/order-details/{orderId}")
    @RequiresRole({"ADMIN", "FINANCE", "FOREMAN"})
    public Result<Map<String, Object>> getOrderCostDetails(@PathVariable Long orderId) {
        return Result.success(costAccountingService.getOrderCostDetails(orderId));
    }

    @PostMapping("/auto-generate/{orderId}")
    @RequiresRole({"ADMIN", "FINANCE"})
    public Result<Void> autoGenerateAccounting(@PathVariable Long orderId) {
        costAccountingService.autoGenerateAccounting(orderId);
        return Result.success();
    }
}
