package com.liquor.brewing.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.liquor.brewing.common.PageQuery;
import com.liquor.brewing.common.PageResult;
import com.liquor.brewing.common.Result;
import com.liquor.brewing.entity.LiquorFormula;
import com.liquor.brewing.service.LiquorFormulaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.*;

@Tag(name = "酒水配方管理", description = "酒水配方管理接口")
@RestController
@RequestMapping("/formula")
public class LiquorFormulaController {

    @Resource
    private LiquorFormulaService formulaService;

    @Operation(summary = "分页查询配方列表")
    @GetMapping("/page")
    public Result<PageResult<LiquorFormula>> page(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Integer status,
            PageQuery pageQuery) {
        IPage<LiquorFormula> page = formulaService.page(keyword, categoryId, status, pageQuery);
        return Result.success(PageResult.of(page));
    }

    @Operation(summary = "获取配方详情")
    @GetMapping("/{id}")
    public Result<LiquorFormula> getById(@PathVariable Long id) {
        return Result.success(formulaService.getById(id));
    }

    @Operation(summary = "新增配方")
    @PostMapping
    public Result<Void> add(@RequestBody LiquorFormula formula) {
        formulaService.add(formula);
        return Result.success();
    }

    @Operation(summary = "修改配方")
    @PutMapping
    public Result<Void> update(@RequestBody LiquorFormula formula) {
        formulaService.update(formula);
        return Result.success();
    }

    @Operation(summary = "删除配方")
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        formulaService.delete(id);
        return Result.success();
    }

    @Operation(summary = "修改配方状态")
    @PutMapping("/{id}/status")
    public Result<Void> updateStatus(@PathVariable Long id, @RequestParam Integer status) {
        formulaService.updateStatus(id, status);
        return Result.success();
    }
}
