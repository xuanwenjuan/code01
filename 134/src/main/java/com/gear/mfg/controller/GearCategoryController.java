package com.gear.mfg.controller;

import com.gear.mfg.annotation.RequireRole;
import com.gear.mfg.common.Result;
import com.gear.mfg.dto.CategoryTreeVO;
import com.gear.mfg.entity.GearCategory;
import com.gear.mfg.service.GearCategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/category")
@RequiredArgsConstructor
public class GearCategoryController {

    private final GearCategoryService gearCategoryService;

    @PostMapping
    @RequireRole({"PURCHASE", "PROCESS_ENGINEER"})
    public Result<Void> addCategory(@Valid @RequestBody GearCategory category) {
        gearCategoryService.addCategory(category);
        return Result.success();
    }

    @PutMapping
    @RequireRole({"PURCHASE", "PROCESS_ENGINEER"})
    public Result<Void> updateCategory(@Valid @RequestBody GearCategory category) {
        gearCategoryService.updateCategory(category);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @RequireRole({"PURCHASE", "PROCESS_ENGINEER"})
    public Result<Void> deleteCategory(@PathVariable Long id) {
        gearCategoryService.deleteCategory(id);
        return Result.success();
    }

    @GetMapping("/{id}")
    public Result<GearCategory> getCategoryById(@PathVariable Long id) {
        return Result.success(gearCategoryService.getCategoryById(id));
    }

    @GetMapping("/tree")
    public Result<List<CategoryTreeVO>> getCategoryTree() {
        return Result.success(gearCategoryService.getCategoryTree());
    }

    @PutMapping("/{id}/priority/{priority}")
    @RequireRole({"PURCHASE", "PROCESS_ENGINEER"})
    public Result<Void> updatePriority(@PathVariable Long id, @PathVariable Integer priority) {
        gearCategoryService.updatePriority(id, priority);
        return Result.success();
    }

    @PutMapping("/{id}/offline")
    @RequireRole({"PURCHASE", "PROCESS_ENGINEER"})
    public Result<Void> offlineCategory(@PathVariable Long id) {
        gearCategoryService.offlineCategory(id);
        return Result.success();
    }
}