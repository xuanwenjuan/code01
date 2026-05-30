package com.ancientpaper.controller;

import com.ancientpaper.annotation.Log;
import com.ancientpaper.annotation.RequiresRole;
import com.ancientpaper.common.Result;
import com.ancientpaper.dto.FinanceLedgerDTO;
import com.ancientpaper.entity.FinanceLedger;
import com.ancientpaper.service.FinanceLedgerService;
import com.ancientpaper.vo.FinanceReportVO;
import com.ancientpaper.validation.CreateGroup;
import com.ancientpaper.validation.UpdateGroup;
import com.baomidou.mybatisplus.core.metadata.IPage;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/ledger")
@RequiredArgsConstructor
@Validated
public class FinanceLedgerController {

    private final FinanceLedgerService ledgerService;

    @GetMapping("/page")
    @RequiresRole({3, 4})
    public Result<IPage<FinanceLedger>> getLedgerPage(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        return Result.success(ledgerService.getLedgerPage(pageNum, pageSize, categoryId, startDate, endDate));
    }

    @GetMapping("/{id}")
    @RequiresRole({3, 4})
    public Result<FinanceLedger> getLedgerById(@PathVariable @Positive(message = "台账ID必须大于0") Long id) {
        return Result.success(ledgerService.getLedgerById(id));
    }

    @PostMapping
    @RequiresRole({3, 4})
    @Log(module = "财务台账", type = "新增", desc = "新增财务台账")
    public Result<Void> addLedger(@Validated(CreateGroup.class) @RequestBody FinanceLedgerDTO dto) {
        ledgerService.addLedger(dto);
        return Result.success();
    }

    @PutMapping
    @RequiresRole({3, 4})
    @Log(module = "财务台账", type = "修改", desc = "修改财务台账")
    public Result<Void> updateLedger(@Validated(UpdateGroup.class) @RequestBody FinanceLedgerDTO dto) {
        ledgerService.updateLedger(dto);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @RequiresRole({4})
    @Log(module = "财务台账", type = "删除", desc = "删除财务台账")
    public Result<Void> deleteLedger(@PathVariable @Positive(message = "台账ID必须大于0") Long id) {
        ledgerService.deleteLedger(id);
        return Result.success();
    }

    @GetMapping("/report")
    @RequiresRole({3, 4})
    public Result<List<FinanceReportVO>> generateReport(
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        return Result.success(ledgerService.generateReport(startDate, endDate));
    }
}
