package com.logistics.bigcargo.controller;

import com.logistics.bigcargo.common.Result;
import com.logistics.bigcargo.dto.CategoryDTO;
import com.logistics.bigcargo.entity.Category;
import com.logistics.bigcargo.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @PostMapping
    @PreAuthorize("hasRole('WAREHOUSE_ADMIN')")
    public Result<Void> addCategory(@Valid @RequestBody CategoryDTO dto) {
        categoryService.addCategory(dto);
        return Result.success("添加成功", null);
    }

    @PutMapping
    @PreAuthorize("hasRole('WAREHOUSE_ADMIN')")
    public Result<Void> updateCategory(@Valid @RequestBody CategoryDTO dto) {
        categoryService.updateCategory(dto);
        return Result.success("更新成功", null);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('WAREHOUSE_ADMIN')")
    public Result<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return Result.success("删除成功", null);
    }

    @PutMapping("/{id}/disable")
    @PreAuthorize("hasRole('WAREHOUSE_ADMIN')")
    public Result<Void> disableCategory(@PathVariable Long id) {
        categoryService.disableCategory(id);
        return Result.success("禁用成功", null);
    }

    @GetMapping("/{id}")
    public Result<Category> getCategoryById(@PathVariable Long id) {
        return Result.success(categoryService.getCategoryById(id));
    }

    @GetMapping("/tree")
    public Result<List<Category>> getCategoryTree() {
        return Result.success(categoryService.getCategoryTree());
    }

    @GetMapping("/parent/{parentId}")
    public Result<List<Category>> getCategoriesByParentId(@PathVariable Long parentId) {
        return Result.success(categoryService.getCategoriesByParentId(parentId));
    }

    @GetMapping("/enabled")
    public Result<List<Category>> getEnabledCategories() {
        return Result.success(categoryService.getEnabledCategories());
    }
}
