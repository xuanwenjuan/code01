package com.sheetmetal.compressor.controller;

import com.sheetmetal.compressor.annotation.OperationLog;
import com.sheetmetal.compressor.annotation.RequiresRole;
import com.sheetmetal.compressor.dto.ShellCategoryDTO;
import com.sheetmetal.compressor.entity.ShellCategory;
import com.sheetmetal.compressor.enums.UserRole;
import com.sheetmetal.compressor.service.ShellCategoryService;
import com.sheetmetal.compressor.common.Result;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/category")
public class ShellCategoryController {

    @Autowired
    private ShellCategoryService categoryService;

    @GetMapping("/tree")
    public Result<List<ShellCategory>> tree() {
        return Result.success(categoryService.tree());
    }

    @GetMapping("/list")
    public Result<List<ShellCategory>> list() {
        return Result.success(categoryService.list());
    }

    @GetMapping("/available")
    public Result<List<ShellCategory>> getAvailableCategories() {
        return Result.success(categoryService.getAvailableCategories());
    }

    @GetMapping("/{id}")
    public Result<ShellCategory> getById(@PathVariable Long id) {
        return Result.success(categoryService.getById(id));
    }

    @PostMapping
    @RequiresRole({UserRole.ADMIN, UserRole.PROCESS_ENGINEER})
    @OperationLog(module = "分类管理", type = "新增", desc = "新增外壳分类")
    public Result<Void> add(@Valid @RequestBody ShellCategoryDTO dto) {
        categoryService.add(dto);
        return Result.success();
    }

    @PutMapping
    @RequiresRole({UserRole.ADMIN, UserRole.PROCESS_ENGINEER})
    @OperationLog(module = "分类管理", type = "修改", desc = "修改外壳分类")
    public Result<Void> update(@Valid @RequestBody ShellCategoryDTO dto) {
        categoryService.update(dto);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @RequiresRole({UserRole.ADMIN})
    @OperationLog(module = "分类管理", type = "删除", desc = "删除外壳分类")
    public Result<Void> delete(@PathVariable Long id) {
        categoryService.delete(id);
        return Result.success();
    }

    @PutMapping("/{id}/priority")
    @RequiresRole({UserRole.ADMIN, UserRole.PRODUCTION_LEADER})
    @OperationLog(module = "分类管理", type = "修改优先级", desc = "修改分类排产优先级")
    public Result<Void> updatePriority(@PathVariable Long id, @RequestParam Integer priority) {
        categoryService.updatePriority(id, priority);
        return Result.success();
    }

    @PutMapping("/{id}/offline")
    @RequiresRole({UserRole.ADMIN})
    @OperationLog(module = "分类管理", type = "下线", desc = "下架外壳分类")
    public Result<Void> offline(@PathVariable Long id) {
        categoryService.offline(id);
        return Result.success();
    }
}
