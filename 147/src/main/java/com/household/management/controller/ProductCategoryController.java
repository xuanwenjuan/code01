package com.household.management.controller;

import com.household.management.common.annotation.OperationLog;
import com.household.management.common.result.Result;
import com.household.management.entity.ProductCategory;
import com.household.management.service.ProductCategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "产品分类管理")
@RestController
@RequestMapping("/product/category")
public class ProductCategoryController {

    private final ProductCategoryService categoryService;

    public ProductCategoryController(ProductCategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping("/tree")
    @Operation(summary = "获取分类树")
    public Result<List<ProductCategory>> getTree() {
        return Result.success(categoryService.getTree());
    }

    @GetMapping("/list")
    @Operation(summary = "获取分类列表")
    public Result<List<ProductCategory>> list() {
        return Result.success(categoryService.list());
    }

    @GetMapping("/{id}")
    @Operation(summary = "获取分类详情")
    public Result<ProductCategory> getById(@PathVariable Long id) {
        return Result.success(categoryService.getById(id));
    }

    @PostMapping
    @Operation(summary = "新增分类")
    @OperationLog(module = "产品分类管理", operation = "新增分类")
    public Result<Void> add(@Valid @RequestBody ProductCategory category) {
        categoryService.add(category);
        return Result.success();
    }

    @PutMapping
    @Operation(summary = "更新分类")
    @OperationLog(module = "产品分类管理", operation = "更新分类")
    public Result<Void> update(@Valid @RequestBody ProductCategory category) {
        categoryService.update(category);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除分类")
    @OperationLog(module = "产品分类管理", operation = "删除分类")
    public Result<Void> delete(@PathVariable Long id) {
        categoryService.delete(id);
        return Result.success();
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "更新分类状态")
    @OperationLog(module = "产品分类管理", operation = "更新分类状态")
    public Result<Void> updateStatus(@PathVariable Long id, @RequestParam Integer status) {
        categoryService.updateStatus(id, status);
        return Result.success();
    }
}
