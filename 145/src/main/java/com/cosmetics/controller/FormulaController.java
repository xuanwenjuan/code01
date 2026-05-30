package com.cosmetics.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cosmetics.annotation.RequireRole;
import com.cosmetics.common.PageQuery;
import com.cosmetics.common.Result;
import com.cosmetics.entity.Formula;
import com.cosmetics.entity.FormulaDetail;
import com.cosmetics.enums.UserRoleEnum;
import com.cosmetics.service.FormulaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "配方管理")
@RestController
@RequestMapping("/formulas")
@RequiredArgsConstructor
public class FormulaController {

    private final FormulaService formulaService;

    @Operation(summary = "分页查询配方列表")
    @GetMapping("/page")
    public Result<Page<Formula>> getPage(
            @ModelAttribute PageQuery pageQuery,
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) Integer status) {
        return Result.success(formulaService.getPage(pageQuery, productId, status));
    }

    @Operation(summary = "获取配方详情")
    @GetMapping("/{id}")
    public Result<Formula> getById(@PathVariable Long id) {
        return Result.success(formulaService.getById(id));
    }

    @Operation(summary = "获取配方明细")
    @GetMapping("/{id}/details")
    public Result<List<FormulaDetail>> getDetails(@PathVariable Long id) {
        return Result.success(formulaService.getDetailsByFormulaId(id));
    }

    @Operation(summary = "新增配方")
    @PostMapping
    @RequireRole({UserRoleEnum.FORMULA_DEVELOPER})
    public Result<Void> add(@RequestBody FormulaWithDetails formulaWithDetails) {
        formulaService.add(formulaWithDetails.getFormula(), formulaWithDetails.getDetails());
        return Result.success();
    }

    @Operation(summary = "更新配方")
    @PutMapping
    @RequireRole({UserRoleEnum.FORMULA_DEVELOPER})
    public Result<Void> update(@RequestBody FormulaWithDetails formulaWithDetails) {
        formulaService.update(formulaWithDetails.getFormula(), formulaWithDetails.getDetails());
        return Result.success();
    }

    @Operation(summary = "删除配方")
    @DeleteMapping("/{id}")
    @RequireRole({UserRoleEnum.FORMULA_DEVELOPER})
    public Result<Void> delete(@PathVariable Long id) {
        formulaService.delete(id);
        return Result.success();
    }

    @Operation(summary = "更新配方状态")
    @PutMapping("/{id}/status")
    @RequireRole({UserRoleEnum.FORMULA_DEVELOPER})
    public Result<Void> updateStatus(@PathVariable Long id, @RequestParam Integer status) {
        formulaService.updateStatus(id, status);
        return Result.success();
    }

    @Data
    public static class FormulaWithDetails {
        private Formula formula;
        private List<FormulaDetail> details;
    }
}
