package com.aromatherapy.controller;

import com.aromatherapy.annotation.RequiresPermission;
import com.aromatherapy.common.Result;
import com.aromatherapy.entity.CostLedger;
import com.aromatherapy.service.CostLedgerService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/ledger")
@RequiredArgsConstructor
public class CostLedgerController {

    private final CostLedgerService ledgerService;

    @GetMapping
    @RequiresPermission("ledger:read")
    public Result<List<CostLedger>> list(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Integer settlementStatus) {
        return Result.success(ledgerService.list(categoryId, settlementStatus));
    }

    @GetMapping("/{id}")
    @RequiresPermission("ledger:read")
    public Result<CostLedger> getById(@PathVariable Long id) {
        return Result.success(ledgerService.getById(id));
    }

    @PostMapping("/generate/{workOrderId}")
    @RequiresPermission("ledger:write")
    public Result<Void> generateLedger(@PathVariable Long workOrderId) {
        ledgerService.generateLedger(workOrderId);
        return Result.success();
    }

    @PutMapping("/{id}/settle")
    @RequiresPermission("ledger:write")
    public Result<Void> settle(@PathVariable Long id) {
        ledgerService.settle(id);
        return Result.success();
    }

    @GetMapping("/statistic")
    @RequiresPermission("ledger:read")
    public Result<List<CostLedger>> statisticByCategory(@RequestParam(required = false) Long categoryId) {
        return Result.success(ledgerService.statisticByCategory(categoryId));
    }
}
