package com.rotor.manufacture.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.rotor.manufacture.annotation.RequiresRole;
import com.rotor.manufacture.common.Result;
import com.rotor.manufacture.dto.CostAccountingQueryDTO;
import com.rotor.manufacture.dto.PageQueryDTO;
import com.rotor.manufacture.entity.CostAccounting;
import com.rotor.manufacture.service.CostAccountingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/cost")
@RequiredArgsConstructor
public class CostAccountingController {

    private final CostAccountingService costAccountingService;

    @PostMapping("/calculate/{orderId}")
    @RequiresRole({"ADMIN", "FINANCE"})
    public Result<CostAccounting> calculateCost(@PathVariable Long orderId) {
        CostAccounting cost = costAccountingService.calculateCost(orderId);
        return Result.success(cost);
    }

    @GetMapping("/list")
    @RequiresRole({"ADMIN", "FINANCE"})
    public Result<List<CostAccounting>> list() {
        List<CostAccounting> list = costAccountingService.list();
        return Result.success(list);
    }

    @PostMapping("/page")
    @RequiresRole({"ADMIN", "FINANCE"})
    public Result<Page<CostAccounting>> pageQuery(@RequestBody PageQueryDTO queryDTO) {
        Page<CostAccounting> page = costAccountingService.pageQuery(queryDTO);
        return Result.success(page);
    }

    @PostMapping("/query")
    @RequiresRole({"ADMIN", "FINANCE"})
    public Result<Page<CostAccounting>> queryByConditions(@Valid @RequestBody CostAccountingQueryDTO queryDTO) {
        Page<CostAccounting> page = costAccountingService.queryByConditions(queryDTO);
        return Result.success(page);
    }

    @GetMapping("/{id}")
    @RequiresRole({"ADMIN", "FINANCE"})
    public Result<CostAccounting> getById(@PathVariable Long id) {
        CostAccounting cost = costAccountingService.getById(id);
        return Result.success(cost);
    }

    @GetMapping("/order/{orderId}")
    @RequiresRole({"ADMIN", "FINANCE"})
    public Result<CostAccounting> getByOrderId(@PathVariable Long orderId) {
        CostAccounting cost = costAccountingService.getByOrderId(orderId);
        return Result.success(cost);
    }

    @GetMapping("/report")
    @RequiresRole({"ADMIN", "FINANCE"})
    public Result<List<CostAccounting>> getReport(
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endDate) {
        List<CostAccounting> list = costAccountingService.getReport(startDate, endDate);
        return Result.success(list);
    }
}