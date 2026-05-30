package com.heritage.dye.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.heritage.dye.common.Result;
import com.heritage.dye.service.SupplyLedgerService;
import com.heritage.dye.vo.SupplyLedgerVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/supply-ledger")
public class SupplyLedgerController {

    @Autowired
    private SupplyLedgerService supplyLedgerService;

    @GetMapping("/{id}")
    public Result<SupplyLedgerVO> getById(@PathVariable Long id) {
        return Result.success(supplyLedgerService.getById(id));
    }

    @GetMapping("/page")
    public Result<Page<SupplyLedgerVO>> page(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate,
            @RequestParam(required = false) Long dyeCategoryId,
            @RequestParam(required = false) Long materialOriginId) {
        return Result.success(supplyLedgerService.page(pageNum, pageSize, startDate, endDate, dyeCategoryId, materialOriginId));
    }

    @GetMapping("/statistics")
    public Result<Map<String, Object>> getStatistics(
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        return Result.success(supplyLedgerService.getStatistics(startDate, endDate));
    }
}
