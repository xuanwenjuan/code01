package com.rotor.manufacture.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.rotor.manufacture.annotation.RequiresRole;
import com.rotor.manufacture.common.Result;
import com.rotor.manufacture.dto.PageQueryDTO;
import com.rotor.manufacture.entity.ProductCategory;
import com.rotor.manufacture.service.ProductCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/category")
@RequiredArgsConstructor
public class ProductCategoryController {

    private final ProductCategoryService productCategoryService;

    @PostMapping
    @RequiresRole({"ADMIN", "PURCHASE"})
    public Result<Void> addCategory(@RequestBody ProductCategory category) {
        productCategoryService.addCategory(category);
        return Result.success();
    }

    @PutMapping
    @RequiresRole({"ADMIN", "PURCHASE"})
    public Result<Void> updateCategory(@RequestBody ProductCategory category) {
        productCategoryService.updateCategory(category);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @RequiresRole({"ADMIN"})
    public Result<Void> deleteCategory(@PathVariable Long id) {
        productCategoryService.deleteCategory(id);
        return Result.success();
    }

    @PutMapping("/{id}/offline")
    @RequiresRole({"ADMIN", "PURCHASE"})
    public Result<Void> offlineCategory(@PathVariable Long id) {
        productCategoryService.offlineCategory(id);
        return Result.success();
    }

    @PutMapping("/{id}/priority")
    @RequiresRole({"ADMIN", "PURCHASE"})
    public Result<Void> updatePriority(@PathVariable Long id, @RequestParam Integer priority) {
        productCategoryService.updatePriority(id, priority);
        return Result.success();
    }

    @GetMapping("/tree")
    public Result<List<ProductCategory>> getTree() {
        List<ProductCategory> tree = productCategoryService.getTree();
        return Result.success(tree);
    }

    @GetMapping("/{id}")
    public Result<ProductCategory> getById(@PathVariable Long id) {
        ProductCategory category = productCategoryService.getById(id);
        return Result.success(category);
    }

    @PostMapping("/page")
    public Result<Page<ProductCategory>> pageQuery(@RequestBody PageQueryDTO queryDTO) {
        Page<ProductCategory> page = productCategoryService.pageQuery(queryDTO);
        return Result.success(page);
    }
}