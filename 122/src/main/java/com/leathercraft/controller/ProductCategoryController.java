package com.leathercraft.controller;

import com.leathercraft.annotation.RequiresRole;
import com.leathercraft.common.Result;
import com.leathercraft.entity.ProductCategory;
import com.leathercraft.enums.RoleEnum;
import com.leathercraft.service.ProductCategoryService;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Validated
@RestController
@RequestMapping("/api/category")
@RequiredArgsConstructor
public class ProductCategoryController {

    private final ProductCategoryService productCategoryService;

    @GetMapping("/tree")
    public Result<List<ProductCategory>> treeList() {
        return Result.success(productCategoryService.treeList());
    }

    @GetMapping("/hot")
    public Result<List<ProductCategory>> getHotCategories() {
        return Result.success(productCategoryService.getHotCategories());
    }

    @PostMapping
    @RequiresRole({RoleEnum.ADMIN})
    public Result<Void> add(@RequestBody @Validated ProductCategory category) {
        productCategoryService.add(category);
        return Result.success();
    }

    @PutMapping
    @RequiresRole({RoleEnum.ADMIN})
    public Result<Void> update(@RequestBody @Validated ProductCategory category) {
        productCategoryService.update(category);
        return Result.success();
    }

    @PutMapping("/{id}/stop")
    @RequiresRole({RoleEnum.ADMIN})
    public Result<Void> stopProduction(@PathVariable @NotNull(message = "ID不能为空") Long id) {
        productCategoryService.stopProduction(id);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @RequiresRole({RoleEnum.ADMIN})
    public Result<Void> delete(@PathVariable @NotNull(message = "ID不能为空") Long id) {
        productCategoryService.delete(id);
        return Result.success();
    }

    @GetMapping("/parent/{parentId}")
    public Result<List<ProductCategory>> listByParentId(@PathVariable Long parentId) {
        return Result.success(productCategoryService.listByParentId(parentId));
    }
}
