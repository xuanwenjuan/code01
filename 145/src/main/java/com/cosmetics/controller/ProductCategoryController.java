package com.cosmetics.controller;

import com.cosmetics.annotation.RequireRole;
import com.cosmetics.common.Result;
import com.cosmetics.entity.ProductCategory;
import com.cosmetics.enums.UserRoleEnum;
import com.cosmetics.service.ProductCategoryService;
import com.cosmetics.vo.CategoryTreeVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "产品分类管理")
@RestController
@RequestMapping("/product-categories")
@RequiredArgsConstructor
public class ProductCategoryController {

    private final ProductCategoryService categoryService;

    @Operation(summary = "获取分类树形结构")
    @GetMapping("/tree")
    public Result<List<CategoryTreeVO>> getCategoryTree() {
        return Result.success(categoryService.getCategoryTree());
    }

    @Operation(summary = "获取分类详情")
    @GetMapping("/{id}")
    public Result<ProductCategory> getById(@PathVariable Long id) {
        return Result.success(categoryService.getById(id));
    }

    @Operation(summary = "新增分类")
    @PostMapping
    @RequireRole({UserRoleEnum.FORMULA_DEVELOPER, UserRoleEnum.PRODUCTION_LEADER})
    public Result<Void> add(@RequestBody ProductCategory category) {
        categoryService.add(category);
        return Result.success();
    }

    @Operation(summary = "更新分类")
    @PutMapping
    @RequireRole({UserRoleEnum.FORMULA_DEVELOPER, UserRoleEnum.PRODUCTION_LEADER})
    public Result<Void> update(@RequestBody ProductCategory category) {
        categoryService.update(category);
        return Result.success();
    }

    @Operation(summary = "删除分类")
    @DeleteMapping("/{id}")
    @RequireRole({UserRoleEnum.FORMULA_DEVELOPER, UserRoleEnum.PRODUCTION_LEADER})
    public Result<Void> delete(@PathVariable Long id) {
        categoryService.delete(id);
        return Result.success();
    }
}
