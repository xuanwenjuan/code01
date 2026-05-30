package com.amber.polish.controller;

import com.amber.polish.annotation.OperationLog;
import com.amber.polish.common.Result;
import com.amber.polish.dto.ProfitLedgerDTO;
import com.amber.polish.entity.ProfitLedger;
import com.amber.polish.service.ProfitLedgerService;
import com.amber.polish.vo.ProfitStatisticsVO;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/profit-ledger")
@RequiredArgsConstructor
public class ProfitLedgerController {

    private final ProfitLedgerService profitLedgerService;

    @GetMapping("/page")
    @PreAuthorize("hasAnyRole('ADMIN')")
    @OperationLog(module = "台账管理", type = "查询", description = "分页查询台账列表")
    public Result<Page<ProfitLedger>> getLedgerPage(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        Page<ProfitLedger> page = profitLedgerService.getLedgerPage(pageNum, pageSize, categoryId, startDate, endDate);
        return Result.success(page);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN')")
    @OperationLog(module = "台账管理", type = "新增", description = "创建盈亏台账")
    public Result<Void> createLedger(@Valid @RequestBody ProfitLedgerDTO dto) {
        profitLedgerService.createLedger(dto);
        return Result.success();
    }

    @PutMapping
    @PreAuthorize("hasAnyRole('ADMIN')")
    @OperationLog(module = "台账管理", type = "修改", description = "修改台账信息")
    public Result<Void> updateLedger(@RequestBody ProfitLedger profitLedger) {
        profitLedgerService.updateById(profitLedger);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    @OperationLog(module = "台账管理", type = "删除", description = "删除台账记录")
    public Result<Void> deleteLedger(@PathVariable Long id) {
        profitLedgerService.removeById(id);
        return Result.success();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    @OperationLog(module = "台账管理", type = "查询", description = "获取台账详情")
    public Result<ProfitLedger> getLedgerById(@PathVariable Long id) {
        ProfitLedger profitLedger = profitLedgerService.getById(id);
        return Result.success(profitLedger);
    }

    @GetMapping("/statistics/category")
    @PreAuthorize("hasAnyRole('ADMIN')")
    @OperationLog(module = "台账管理", type = "查询", description = "按品类统计盈亏")
    public Result<List<ProfitStatisticsVO>> statisticsByCategory(
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        List<ProfitStatisticsVO> statistics = profitLedgerService.statisticsByCategory(startDate, endDate);
        return Result.success(statistics);
    }
}
