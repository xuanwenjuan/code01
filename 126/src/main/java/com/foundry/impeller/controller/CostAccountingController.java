package com.foundry.impeller.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.foundry.impeller.annotation.RequiresRole;
import com.foundry.impeller.common.Result;
import com.foundry.impeller.entity.CostAccounting;
import com.foundry.impeller.service.CostAccountingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/cost-accounting")
@RequiredArgsConstructor
public class CostAccountingController {

    private final CostAccountingService costAccountingService;

    @GetMapping
    public Result<Page<CostAccounting>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        return Result.success(costAccountingService.list(page, size, startDate, endDate));
    }

    @GetMapping("/date/{date}")
    public Result<List<CostAccounting>> listByDate(
            @PathVariable @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date) {
        return Result.success(costAccountingService.listByDate(date));
    }

    @GetMapping("/{id}")
    public Result<CostAccounting> getById(@PathVariable Long id) {
        return Result.success(costAccountingService.getById(id));
    }

    @PostMapping
    @RequiresRole({"ADMIN"})
    public Result<Void> create(@Valid @RequestBody CostAccounting costAccounting) {
        costAccountingService.create(costAccounting);
        return Result.success();
    }

    @PutMapping
    @RequiresRole({"ADMIN"})
    public Result<Void> update(@Valid @RequestBody CostAccounting costAccounting) {
        costAccountingService.update(costAccounting);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @RequiresRole({"ADMIN"})
    public Result<Void> delete(@PathVariable Long id) {
        costAccountingService.delete(id);
        return Result.success();
    }
}
