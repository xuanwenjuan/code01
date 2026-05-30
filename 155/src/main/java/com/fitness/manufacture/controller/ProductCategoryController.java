package com.fitness.manufacture.controller;

import com.fitness.manufacture.common.Result;
import com.fitness.manufacture.dto.ProductCategoryDTO;
import com.fitness.manufacture.service.ProductCategoryService;
import com.fitness.manufacture.vo.CategoryTreeVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "产品分类管理")
@RestController
@RequestMapping("/api/product/categories")
@RequiredArgsConstructor
public class ProductCategoryController {

    private final ProductCategoryService productCategoryService;

    @Operation(summary = "新增产品分类")
    @PostMapping
    public Result<Void> saveCategory(@Valid @RequestBody ProductCategoryDTO dto) {
        productCategoryService.saveCategory(dto);
        return Result.success();
    }

    @Operation(summary = "修改产品分类")
    @PutMapping
    public Result<Void> updateCategory(@Valid @RequestBody ProductCategoryDTO dto) {
        productCategoryService.updateCategory(dto);
        return Result.success();
    }

    @Operation(summary = "删除产品分类")
    @DeleteMapping("/{id}")
    public Result<Void> deleteCategory(@PathVariable Long id) {
        productCategoryService.deleteCategory(id);
        return Result.success();
    }

    @Operation(summary = "获取分类树形结构")
    @GetMapping("/tree")
    public Result<CategoryTreeVO> getCategoryTree() {
        return Result.success(productCategoryService.getCategoryTree());
    }

    @Operation(summary = "获取分类列表（树形）")
    @GetMapping("/list")
    public Result<List<CategoryTreeVO>> getCategoryList() {
        return Result.success(productCategoryService.getCategoryList());
    }

    @Operation(summary = "根据ID获取分类详情")
    @GetMapping("/{id}")
    public Result<ProductCategoryDTO> getCategoryById(@PathVariable Long id) {
        return Result.success(productCategoryService.getCategoryById(id));
    }
}
