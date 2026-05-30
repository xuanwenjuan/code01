package com.stationery.manufacture.controller;

import com.stationery.manufacture.common.RequireRole;
import com.stationery.manufacture.common.Result;
import com.stationery.manufacture.entity.ProductCategory;
import com.stationery.manufacture.service.ProductCategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/category")
@Tag(name = "产品分类管理")
@RequireRole({"DESIGNER", "ADMIN", "PRODUCTION_LEADER"})
public class ProductCategoryController {

    private final ProductCategoryService categoryService;

    public ProductCategoryController(ProductCategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @PostMapping
    @Operation(summary = "新增分类")
    public Result<Void> add(@Valid @RequestBody ProductCategory category) {
        categoryService.addCategory(category);
        return Result.success();
    }

    @PutMapping
    @Operation(summary = "修改分类")
    public Result<Void> update(@Valid @RequestBody ProductCategory category) {
        categoryService.updateCategory(category);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除分类")
    public Result<Void> delete(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return Result.success();
    }

    @GetMapping("/{id}")
    @Operation(summary = "获取分类详情")
    public Result<ProductCategory> getById(@PathVariable Long id) {
        return Result.success(categoryService.getCategoryById(id));
    }

    @GetMapping("/tree")
    @Operation(summary = "获取分类树")
    public Result<List<ProductCategory>> getTree() {
        return Result.success(categoryService.getCategoryTree());
    }

    @GetMapping("/list")
    @Operation(summary = "获取分类列表")
    public Result<List<ProductCategory>> getList(
            @RequestParam(required = false) Long parentId,
            @RequestParam(required = false) String keyword) {
        return Result.success(categoryService.getCategoryList(parentId, keyword));
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "更新分类状态")
    public Result<Void> updateStatus(@PathVariable Long id, @RequestParam Integer status) {
        categoryService.updateStatus(id, status);
        return Result.success();
    }
}
