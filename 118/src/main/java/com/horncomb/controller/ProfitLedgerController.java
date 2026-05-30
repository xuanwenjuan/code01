package com.horncomb.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.horncomb.annotation.RequireRole;
import com.horncomb.common.Constants;
import com.horncomb.common.Result;
import com.horncomb.dto.ProfitLedgerDTO;
import com.horncomb.entity.ProfitLedger;
import com.horncomb.service.ProfitLedgerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ledger")
@RequiredArgsConstructor
public class ProfitLedgerController {

    private final ProfitLedgerService profitLedgerService;

    @GetMapping("/page")
    @RequireRole({Constants.ROLE_ADMIN})
    public Result<IPage<ProfitLedger>> page(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String statisticalMonth
    ) {
        IPage<ProfitLedger> page = profitLedgerService.page(pageNum, pageSize, categoryId, statisticalMonth);
        return Result.success(page);
    }

    @GetMapping("/{id}")
    @RequireRole({Constants.ROLE_ADMIN})
    public Result<ProfitLedger> getById(@PathVariable Long id) {
        ProfitLedger ledger = profitLedgerService.getById(id);
        return Result.success(ledger);
    }

    @PostMapping
    @RequireRole({Constants.ROLE_ADMIN})
    public Result<Void> create(@Valid @RequestBody ProfitLedgerDTO dto) {
        profitLedgerService.create(dto);
        return Result.success("创建成功", null);
    }

    @PutMapping
    @RequireRole({Constants.ROLE_ADMIN})
    public Result<Void> update(@Valid @RequestBody ProfitLedgerDTO dto) {
        profitLedgerService.update(dto);
        return Result.success("更新成功", null);
    }

    @DeleteMapping("/{id}")
    @RequireRole({Constants.ROLE_ADMIN})
    public Result<Void> delete(@PathVariable Long id) {
        profitLedgerService.delete(id);
        return Result.success("删除成功", null);
    }
}
