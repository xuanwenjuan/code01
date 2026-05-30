package com.battery.shell.controller;

import com.battery.shell.annotation.RequireRole;
import com.battery.shell.common.Result;
import com.battery.shell.constant.RoleConstant;
import com.battery.shell.dto.ShellCategoryDTO;
import com.battery.shell.entity.ShellCategory;
import com.battery.shell.service.ShellCategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/category")
@RequiredArgsConstructor
public class ShellCategoryController {

    private final ShellCategoryService shellCategoryService;

    @PostMapping
    @RequireRole({RoleConstant.PROCESS, RoleConstant.ADMIN})
    public Result<Void> addCategory(@Valid @RequestBody ShellCategoryDTO dto) {
        shellCategoryService.addCategory(dto);
        return Result.success("分类添加成功", null);
    }

    @PutMapping
    @RequireRole({RoleConstant.PROCESS, RoleConstant.ADMIN})
    public Result<Void> updateCategory(@Valid @RequestBody ShellCategoryDTO dto) {
        shellCategoryService.updateCategory(dto);
        return Result.success("分类更新成功", null);
    }

    @DeleteMapping("/{id}")
    @RequireRole({RoleConstant.ADMIN})
    public Result<Void> deleteCategory(@PathVariable Long id) {
        shellCategoryService.deleteCategory(id);
        return Result.success("分类删除成功", null);
    }

    @GetMapping("/{id}")
    public Result<ShellCategory> getCategoryById(@PathVariable Long id) {
        ShellCategory category = shellCategoryService.getCategoryById(id);
        if (category == null) {
            return Result.notFound("分类不存在");
        }
        return Result.success(category);
    }

    @GetMapping("/tree")
    public Result<List<ShellCategory>> getCategoryTree() {
        return Result.success(shellCategoryService.getCategoryTree());
    }

    @GetMapping("/type/{categoryType}")
    public Result<List<ShellCategory>> getCategoriesByType(@PathVariable String categoryType) {
        return Result.success(shellCategoryService.getCategoriesByType(categoryType));
    }

    @GetMapping("/hot")
    public Result<List<ShellCategory>> getHotCategories() {
        return Result.success(shellCategoryService.getHotCategories());
    }

    @PutMapping("/{id}/offline")
    @RequireRole({RoleConstant.PROCESS, RoleConstant.ADMIN})
    public Result<Void> offlineCategory(@PathVariable Long id) {
        shellCategoryService.offlineCategory(id);
        return Result.success("型号已下线", null);
    }
}
