package com.construction.embedded.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.construction.embedded.annotation.RequiresRole;
import com.construction.embedded.common.Result;
import com.construction.embedded.constant.RoleConstants;
import com.construction.embedded.dto.CostAccountingDTO;
import com.construction.embedded.entity.CostAccounting;
import com.construction.embedded.service.CostAccountingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cost")
public class CostAccountingController {

    @Autowired
    private CostAccountingService costAccountingService;

    @GetMapping
    @RequiresRole({RoleConstants.TECHNICIAN, RoleConstants.TEAM_LEADER, RoleConstants.ADMIN})
    public Result<IPage<CostAccounting>> list(
            @RequestParam(required = false) String accountingMonth,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        IPage<CostAccounting> page = costAccountingService.list(accountingMonth, categoryId, pageNum, pageSize);
        return Result.success(page);
    }

    @GetMapping("/{id}")
    @RequiresRole({RoleConstants.TECHNICIAN, RoleConstants.TEAM_LEADER, RoleConstants.ADMIN})
    public Result<CostAccounting> getById(@PathVariable Long id) {
        CostAccounting accounting = costAccountingService.getById(id);
        return Result.success(accounting);
    }

    @GetMapping("/month/{accountingMonth}")
    @RequiresRole({RoleConstants.TECHNICIAN, RoleConstants.TEAM_LEADER, RoleConstants.ADMIN})
    public Result<CostAccounting> getByMonth(@PathVariable String accountingMonth) {
        CostAccounting accounting = costAccountingService.getByMonth(accountingMonth);
        return Result.success(accounting);
    }

    @PostMapping("/generate")
    @RequiresRole({RoleConstants.TECHNICIAN, RoleConstants.ADMIN})
    public Result<Void> generateMonthlyReport(@RequestParam String accountingMonth) {
        costAccountingService.generateMonthlyReport(accountingMonth);
        return Result.success("报表生成成功", null);
    }

    @PutMapping
    @RequiresRole({RoleConstants.TECHNICIAN, RoleConstants.ADMIN})
    public Result<Void> updateCost(@Valid @RequestBody CostAccountingDTO dto) {
        costAccountingService.updateCost(dto);
        return Result.success("更新成功", null);
    }

    @PutMapping("/confirm/{id}")
    @RequiresRole({RoleConstants.ADMIN})
    public Result<Void> confirmCost(@PathVariable Long id) {
        costAccountingService.confirmCost(id);
        return Result.success("确认成功", null);
    }

    @DeleteMapping("/{id}")
    @RequiresRole({RoleConstants.ADMIN})
    public Result<Void> deleteCost(@PathVariable Long id) {
        costAccountingService.deleteCost(id);
        return Result.success("删除成功", null);
    }

    @GetMapping("/yearly/{year}")
    @RequiresRole({RoleConstants.TECHNICIAN, RoleConstants.TEAM_LEADER, RoleConstants.ADMIN})
    public Result<List<CostAccounting>> getYearlyReport(@PathVariable String year) {
        List<CostAccounting> list = costAccountingService.getYearlyReport(year);
        return Result.success(list);
    }
}
