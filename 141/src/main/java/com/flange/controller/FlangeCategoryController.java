package com.flange.controller;

import com.flange.common.Result;
import com.flange.dto.CategoryDto;
import com.flange.entity.FlangeCategory;
import com.flange.service.FlangeCategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/category")
@RequiredArgsConstructor
public class FlangeCategoryController {

    private final FlangeCategoryService categoryService;

    @GetMapping("/tree")
    public Result<List<FlangeCategory>> getCategoryTree() {
        List<FlangeCategory> tree = categoryService.getCategoryTree();
        return Result.success(tree);
    }

    @GetMapping("/{id}")
    public Result<FlangeCategory> getCategoryById(@PathVariable Long id) {
        FlangeCategory category = categoryService.getCategoryById(id);
        return Result.success(category);
    }

    @GetMapping("/children/{parentId}")
    public Result<List<FlangeCategory>> getChildCategories(@PathVariable Long parentId) {
        List<FlangeCategory> categories = categoryService.getChildCategories(parentId);
        return Result.success(categories);
    }

    @PostMapping
    public Result<Void> addCategory(@Valid @RequestBody CategoryDto dto) {
        categoryService.addCategory(dto);
        return Result.success();
    }

    @PutMapping
    public Result<Void> updateCategory(@Valid @RequestBody CategoryDto dto) {
        categoryService.updateCategory(dto);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return Result.success();
    }
}
