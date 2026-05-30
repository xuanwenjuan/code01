package com.plastic.injection.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.plastic.injection.annotation.RequirePermission;
import com.plastic.injection.common.Result;
import com.plastic.injection.dto.ProductCategoryDTO;
import com.plastic.injection.enums.PermissionType;
import com.plastic.injection.service.ProductCategoryService;
import com.plastic.injection.vo.CategoryTreeVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/product-category")
@RequiredArgsConstructor
public class ProductCategoryController {

    private final ProductCategoryService productCategoryService;

    @PostMapping
    @RequirePermission(PermissionType.CATEGORY_MANAGE)
    public Result<Long> create(@Valid @RequestBody ProductCategoryDTO dto) {
        return Result.success(productCategoryService.saveCategory(dto));
    }

    @PutMapping("/{id}")
    @RequirePermission(PermissionType.CATEGORY_MANAGE)
    public Result<Long> update(@PathVariable Long id, @Valid @RequestBody ProductCategoryDTO dto) {
        dto.setId(id);
        return Result.success(productCategoryService.saveCategory(dto));
    }

    @GetMapping("/tree")
    public Result<List<CategoryTreeVO>> getTree() {
        return Result.success(productCategoryService.getCategoryTree());
    }

    @GetMapping("/hot")
    public Result<List<CategoryTreeVO>> getHotCategories() {
        return Result.success(productCategoryService.getHotCategories());
    }

    @GetMapping("/page")
    @RequirePermission(PermissionType.CATEGORY_VIEW)
    public Result<Page<CategoryTreeVO>> page(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String categoryName,
            @RequestParam(required = false) Integer status) {
        return Result.success(productCategoryService.pageQuery(pageNum, pageSize, categoryName, status));
    }

    @GetMapping("/{id}")
    public Result<CategoryTreeVO> getById(@PathVariable Long id) {
        return Result.success(productCategoryService.getById(id));
    }

    @PutMapping("/{id}/status")
    @RequirePermission(PermissionType.CATEGORY_MANAGE)
    public Result<Void> updateStatus(@PathVariable Long id, @RequestParam Integer status) {
        productCategoryService.updateStatus(id, status);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @RequirePermission(PermissionType.CATEGORY_MANAGE)
    public Result<Void> delete(@PathVariable Long id) {
        productCategoryService.deleteById(id);
        return Result.success();
    }
}
