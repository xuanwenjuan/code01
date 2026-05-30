package com.leathercraft.controller;

import com.leathercraft.annotation.RequiresRole;
import com.leathercraft.common.Result;
import com.leathercraft.dto.ProfitLedgerDTO;
import com.leathercraft.entity.ProfitLedger;
import com.leathercraft.enums.RoleEnum;
import com.leathercraft.service.ProfitLedgerService;
import com.leathercraft.vo.ProfitLedgerVO;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Validated
@RestController
@RequestMapping("/api/ledger")
@RequiredArgsConstructor
public class ProfitLedgerController {

    private final ProfitLedgerService profitLedgerService;

    @PostMapping
    @RequiresRole({RoleEnum.ADMIN})
    public Result<Void> create(@RequestBody @Valid ProfitLedgerDTO dto) {
        ProfitLedger ledger = new ProfitLedger();
        ledger.setProductCategoryId(dto.getProductCategoryId());
        ledger.setProductCategoryName(dto.getProductCategoryName());
        ledger.setQuantity(dto.getQuantity());
        ledger.setLeatherCost(dto.getLeatherCost());
        ledger.setMaterialCost(dto.getMaterialCost());
        ledger.setLaborCost(dto.getLaborCost());
        ledger.setSellingPrice(dto.getSellingPrice());
        ledger.setStatDate(dto.getStatDate());
        ledger.setRemark(dto.getRemark());
        profitLedgerService.create(ledger);
        return Result.success();
    }

    @PutMapping
    @RequiresRole({RoleEnum.ADMIN})
    public Result<Void> update(@RequestBody @Valid ProfitLedger ledger) {
        profitLedgerService.update(ledger);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @RequiresRole({RoleEnum.ADMIN})
    public Result<Void> delete(@PathVariable @NotNull(message = "ID不能为空") Long id) {
        profitLedgerService.delete(id);
        return Result.success();
    }

    @GetMapping
    @RequiresRole({RoleEnum.ADMIN})
    public Result<List<ProfitLedgerVO>> list(
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate,
            @RequestParam(required = false) Long categoryId) {
        List<ProfitLedger> list = profitLedgerService.list(startDate, endDate, categoryId);
        List<ProfitLedgerVO> voList = list.stream().map(ledger -> {
            ProfitLedgerVO vo = new ProfitLedgerVO();
            org.springframework.beans.BeanUtils.copyProperties(ledger, vo);
            return vo;
        }).collect(java.util.stream.Collectors.toList());
        return Result.success(voList);
    }

    @GetMapping("/statistics")
    @RequiresRole({RoleEnum.ADMIN})
    public Result<Map<String, Object>> getStatistics(
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        return Result.success(profitLedgerService.getStatistics(startDate, endDate));
    }

    @GetMapping("/trend")
    @RequiresRole({RoleEnum.ADMIN})
    public Result<Map<String, Object>> getMonthlyTrend(
            @RequestParam(defaultValue = "6") int months) {
        return Result.success(profitLedgerService.getMonthlyTrend(months));
    }

    @GetMapping("/{id}")
    @RequiresRole({RoleEnum.ADMIN})
    public Result<ProfitLedgerVO> getById(@PathVariable @NotNull(message = "ID不能为空") Long id) {
        ProfitLedger ledger = profitLedgerService.getById(id);
        ProfitLedgerVO vo = new ProfitLedgerVO();
        org.springframework.beans.BeanUtils.copyProperties(ledger, vo);
        return Result.success(vo);
    }
}
