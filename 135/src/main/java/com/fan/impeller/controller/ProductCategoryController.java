package com.fan.impeller.controller;

import com.fan.impeller.common.Result;
import com.fan.impeller.entity.ProductCategory;
import com.fan.impeller.service.ProductCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/product-category")
@RequiredArgsConstructor
public class ProductCategoryController {

    private final ProductCategoryService productCategoryService;

    @GetMapping("/tree")
    public Result<List<ProductCategory>> tree() {
        return Result.success(productCategoryService.tree());
    }

    @GetMapping("/list-by-priority")
    public Result<List<ProductCategory>> listByPriority() {
        return Result.success(productCategoryService.listByPriority());
    }

    @PostMapping
    public Result<Void> add(@RequestBody ProductCategory category) {
        productCategoryService.addCategory(category);
        return Result.success();
    }

    @PutMapping
    public Result<Void> update(@RequestBody ProductCategory category) {
        productCategoryService.updateCategory(category);
        return Result.success();
    }

    @PutMapping("/offline/{id}")
    public Result<Void> offline(@PathVariable Long id) {
        productCategoryService.offline(id);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        productCategoryService.removeById(id);
        return Result.success();
    }
}
