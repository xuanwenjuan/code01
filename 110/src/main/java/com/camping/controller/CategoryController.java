package com.camping.controller;

import com.camping.annotation.Log;
import com.camping.common.Result;
import com.camping.entity.Category;
import com.camping.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/category")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping("/tree")
    @Log(module = "类目管理", operation = "查询类目树")
    public Result<List<Category>> tree() {
        List<Category> tree = categoryService.tree();
        return Result.success(tree);
    }

    @GetMapping("/available")
    @Log(module = "类目管理", operation = "查询可用类目")
    public Result<List<Category>> getAvailableCategories() {
        List<Category> list = categoryService.getAvailableCategories();
        return Result.success(list);
    }

    @GetMapping("/{id}")
    @Log(module = "类目管理", operation = "查询类目详情")
    public Result<Category> getById(@PathVariable Long id) {
        Category category = categoryService.getById(id);
        return Result.success(category);
    }

    @PostMapping
    @Log(module = "类目管理", operation = "新增类目")
    public Result<Void> add(@Valid @RequestBody Category category) {
        categoryService.addCategory(category);
        return Result.success();
    }

    @PutMapping
    @Log(module = "类目管理", operation = "更新类目")
    public Result<Void> update(@Valid @RequestBody Category category) {
        categoryService.updateCategory(category);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @Log(module = "类目管理", operation = "删除类目")
    public Result<Void> delete(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return Result.success();
    }

    @PutMapping("/offline/{id}")
    @Log(module = "类目管理", operation = "下架类目")
    public Result<Void> offline(@PathVariable Long id) {
        categoryService.offlineCategory(id);
        return Result.success();
    }
}
