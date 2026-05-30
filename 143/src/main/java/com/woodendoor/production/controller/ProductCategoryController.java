package com.woodendoor.production.controller;

import com.woodendoor.production.common.Result;
import com.woodendoor.production.entity.ProductCategory;
import com.woodendoor.production.service.ProductCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/product-category")
@RequiredArgsConstructor
public class ProductCategoryController {

    private final ProductCategoryService productCategoryService;

    @GetMapping("/tree")
    public Result<List<ProductCategory>> tree() {
        return Result.success(productCategoryService.tree());
    }

    @PostMapping
    public Result<Void> add(@RequestBody ProductCategory category) {
        productCategoryService.addCategory(category);
        return Result.success();
    }

    @PutMapping("/{id}/status")
    public Result<Void> updateStatus(@PathVariable Long id, @RequestParam Integer status) {
        productCategoryService.updateStatus(id, status);
        return Result.success();
    }

    @GetMapping("/level/{level}")
    public Result<List<ProductCategory>> getByLevel(@PathVariable Integer level) {
        return Result.success(productCategoryService.getByLevel(level));
    }
}