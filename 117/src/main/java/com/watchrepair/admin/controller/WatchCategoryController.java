package com.watchrepair.admin.controller;

import com.watchrepair.admin.common.Result;
import com.watchrepair.admin.entity.WatchCategory;
import com.watchrepair.admin.enums.RoleEnum;
import com.watchrepair.admin.service.WatchCategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/category")
@RequiredArgsConstructor
public class WatchCategoryController {

    private final WatchCategoryService categoryService;

    @GetMapping("/tree")
    public Result<List<WatchCategory>> getCategoryTree() {
        return Result.success(categoryService.getCategoryTree());
    }

    @GetMapping("/hot")
    public Result<List<WatchCategory>> getHotCategories() {
        return Result.success(categoryService.getHotCategories());
    }

    @GetMapping("/normal")
    public Result<List<WatchCategory>> getNormalCategories() {
        return Result.success(categoryService.getNormalCategories());
    }

    @GetMapping("/{id}")
    public Result<WatchCategory> getCategoryById(@PathVariable Long id) {
        return Result.success(categoryService.getCategoryById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('4', '3')")
    public Result<Void> addCategory(@Valid @RequestBody WatchCategory category) {
        categoryService.addCategory(category);
        return Result.success();
    }

    @PutMapping
    @PreAuthorize("hasAnyRole('4', '3')")
    public Result<Void> updateCategory(@Valid @RequestBody WatchCategory category) {
        categoryService.updateCategory(category);
        return Result.success();
    }

    @PutMapping("/{id}/discontinue")
    @PreAuthorize("hasAnyRole('4', '3')")
    public Result<Void> discontinueCategory(@PathVariable Long id) {
        categoryService.discontinueCategory(id);
        return Result.success();
    }
}