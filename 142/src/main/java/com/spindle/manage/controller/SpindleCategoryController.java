package com.spindle.manage.controller;

import com.spindle.manage.annotation.RequiresPermission;
import com.spindle.manage.common.Result;
import com.spindle.manage.entity.SpindleCategory;
import com.spindle.manage.service.SpindleCategoryService;
import com.spindle.manage.vo.CategoryTreeVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/category")
@RequiredArgsConstructor
public class SpindleCategoryController {

    private final SpindleCategoryService spindleCategoryService;

    @GetMapping("/tree")
    public Result<List<CategoryTreeVO>> getCategoryTree() {
        return Result.success(spindleCategoryService.getCategoryTree());
    }

    @PostMapping
    @RequiresPermission({"category:add"})
    public Result<Void> addCategory(@Valid @RequestBody SpindleCategory category) {
        spindleCategoryService.addCategory(category);
        return Result.success();
    }

    @PutMapping
    @RequiresPermission({"category:update"})
    public Result<Void> updateCategory(@Valid @RequestBody SpindleCategory category) {
        spindleCategoryService.updateCategory(category);
        return Result.success();
    }

    @PutMapping("/{id}/offline")
    @RequiresPermission({"category:offline"})
    public Result<Void> offlineCategory(@PathVariable Long id) {
        spindleCategoryService.offlineCategory(id);
        return Result.success();
    }

    @PutMapping("/{id}/priority")
    @RequiresPermission({"category:update"})
    public Result<Void> updatePriority(@PathVariable Long id, @RequestParam Integer sort) {
        spindleCategoryService.updatePriority(id, sort);
        return Result.success();
    }

}
