package com.construction.embedded.controller;

import com.construction.embedded.common.Result;
import com.construction.embedded.entity.ProductCategory;
import com.construction.embedded.service.ProductCategoryService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/category")
public class ProductCategoryController {

    @Autowired
    private ProductCategoryService productCategoryService;

    @GetMapping("/tree")
    public Result<List<ProductCategory>> getCategoryTree() {
        List<ProductCategory> tree = productCategoryService.getCategoryTree();
        return Result.success(tree);
    }

    @GetMapping("/available")
    public Result<List<ProductCategory>> getAvailableCategories() {
        List<ProductCategory> list = productCategoryService.getAvailableCategories();
        return Result.success(list);
    }

    @GetMapping("/{id}")
    public Result<ProductCategory> getById(@PathVariable @NotNull(message = "分类ID不能为空") Long id) {
        ProductCategory category = productCategoryService.getById(id);
        return Result.success(category);
    }

    @PostMapping
    public Result<Void> addCategory(@Valid @RequestBody ProductCategory category) {
        productCategoryService.addCategory(category);
        return Result.success("添加成功", null);
    }

    @PutMapping
    public Result<Void> updateCategory(@Valid @RequestBody ProductCategory category) {
        productCategoryService.updateCategory(category);
        return Result.success("更新成功", null);
    }

    @PutMapping("/offline/{id}")
    public Result<Void> offlineCategory(@PathVariable @NotNull(message = "分类ID不能为空") Long id) {
        productCategoryService.offlineCategory(id);
        return Result.success("下线成功", null);
    }

    @PutMapping("/online/{id}")
    public Result<Void> onlineCategory(@PathVariable @NotNull(message = "分类ID不能为空") Long id) {
        productCategoryService.onlineCategory(id);
        return Result.success("上线成功", null);
    }

    @DeleteMapping("/{id}")
    public Result<Void> deleteCategory(@PathVariable @NotNull(message = "分类ID不能为空") Long id) {
        productCategoryService.deleteCategory(id);
        return Result.success("删除成功", null);
    }

    @GetMapping("/type/{categoryType}")
    public Result<List<ProductCategory>> getByType(
            @PathVariable @NotBlank(message = "分类类型不能为空") String categoryType) {
        List<ProductCategory> list = productCategoryService.getByType(categoryType);
        return Result.success(list);
    }
}
