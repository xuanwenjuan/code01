package com.radiator.management.controller;

import com.radiator.management.annotation.OpLog;
import com.radiator.management.common.Result;
import com.radiator.management.entity.RadiatorCategory;
import com.radiator.management.service.RadiatorCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/category")
@RequiredArgsConstructor
public class RadiatorCategoryController {

    private final RadiatorCategoryService categoryService;

    @PostMapping
    @OpLog(module = "散热器品类", operation = "新增品类")
    public Result<Void> addCategory(@RequestBody RadiatorCategory category) {
        categoryService.addCategory(category);
        return Result.success();
    }

    @PutMapping
    @OpLog(module = "散热器品类", operation = "更新品类")
    public Result<Void> updateCategory(@RequestBody RadiatorCategory category) {
        categoryService.updateCategory(category);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @OpLog(module = "散热器品类", operation = "删除品类")
    public Result<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return Result.success();
    }

    @GetMapping("/tree")
    public Result<List<RadiatorCategory>> getTree() {
        return Result.success(categoryService.getTree());
    }

    @GetMapping("/active")
    public Result<List<RadiatorCategory>> getActiveCategories() {
        return Result.success(categoryService.getActiveCategories());
    }
}