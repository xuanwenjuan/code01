package com.foundry.impeller.controller;

import com.foundry.impeller.annotation.RequiresRole;
import com.foundry.impeller.common.Result;
import com.foundry.impeller.entity.ProductCategory;
import com.foundry.impeller.service.ProductCategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/product-categories")
@RequiredArgsConstructor
public class ProductCategoryController {

    private final ProductCategoryService categoryService;

    @GetMapping("/tree")
    public Result<List<ProductCategory>> tree() {
        return Result.success(categoryService.tree());
    }

    @GetMapping
    public Result<List<ProductCategory>> list() {
        return Result.success(categoryService.list());
    }

    @GetMapping("/{id}")
    public Result<ProductCategory> getById(@PathVariable Long id) {
        return Result.success(categoryService.getById(id));
    }

    @PostMapping
    @RequiresRole({"ADMIN"})
    public Result<Void> create(@Valid @RequestBody ProductCategory category) {
        categoryService.create(category);
        return Result.success();
    }

    @PutMapping
    @RequiresRole({"ADMIN"})
    public Result<Void> update(@Valid @RequestBody ProductCategory category) {
        categoryService.update(category);
        return Result.success();
    }

    @PutMapping("/{id}/status")
    @RequiresRole({"ADMIN"})
    public Result<Void> updateStatus(@PathVariable Long id, @RequestParam Integer status) {
        categoryService.updateStatus(id, status);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @RequiresRole({"ADMIN"})
    public Result<Void> delete(@PathVariable Long id) {
        categoryService.delete(id);
        return Result.success();
    }
}
