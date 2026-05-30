package com.hardware.stamping.controller;

import com.hardware.stamping.annotation.RequiresRole;
import com.hardware.stamping.common.Result;
import com.hardware.stamping.entity.ProductCategory;
import com.hardware.stamping.service.ProductCategoryService;
import com.hardware.stamping.vo.ProductCategoryVO;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/product-category")
public class ProductCategoryController {

    @Autowired
    private ProductCategoryService productCategoryService;

    @PostMapping
    @RequiresRole({"ADMIN", "FOREMAN"})
    public Result<Void> addCategory(@Valid @RequestBody ProductCategory category) {
        productCategoryService.addCategory(category);
        return Result.success();
    }

    @PutMapping
    @RequiresRole({"ADMIN", "FOREMAN"})
    public Result<Void> updateCategory(@Valid @RequestBody ProductCategory category) {
        productCategoryService.updateCategory(category);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @RequiresRole({"ADMIN"})
    public Result<Void> deleteCategory(@PathVariable Long id) {
        productCategoryService.deleteCategory(id);
        return Result.success();
    }

    @PutMapping("/{id}/discontinue")
    @RequiresRole({"ADMIN", "FOREMAN"})
    public Result<Void> discontinueCategory(@PathVariable Long id) {
        productCategoryService.discontinueCategory(id);
        return Result.success();
    }

    @PutMapping("/{id}/resume")
    @RequiresRole({"ADMIN", "FOREMAN"})
    public Result<Void> resumeCategory(@PathVariable Long id) {
        productCategoryService.resumeCategory(id);
        return Result.success();
    }

    @GetMapping("/{id}")
    public Result<ProductCategory> getById(@PathVariable Long id) {
        return Result.success(productCategoryService.getById(id));
    }

    @GetMapping("/list")
    public Result<List<ProductCategory>> listAll() {
        return Result.success(productCategoryService.listAll());
    }

    @GetMapping("/tree")
    public Result<List<ProductCategoryVO>> treeList() {
        return Result.success(productCategoryService.treeList());
    }

    @GetMapping("/parent/{parentId}")
    public Result<List<ProductCategory>> listByParentId(@PathVariable Long parentId) {
        return Result.success(productCategoryService.listByParentId(parentId));
    }

    @GetMapping("/active")
    public Result<List<ProductCategory>> getActiveCategories() {
        return Result.success(productCategoryService.getActiveCategories());
    }
}
