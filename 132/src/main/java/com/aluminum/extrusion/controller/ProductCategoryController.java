package com.aluminum.extrusion.controller;

import com.aluminum.extrusion.annotation.RequireRole;
import com.aluminum.extrusion.common.Result;
import com.aluminum.extrusion.entity.ProductCategory;
import com.aluminum.extrusion.enums.RoleEnum;
import com.aluminum.extrusion.service.ProductCategoryService;
import com.aluminum.extrusion.vo.CategoryTreeVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/category")
@RequiredArgsConstructor
public class ProductCategoryController {

    private final ProductCategoryService productCategoryService;

    @PostMapping
    @RequireRole({RoleEnum.ADMIN, RoleEnum.PROCESS_ENGINEER})
    public Result<Void> addCategory(@Valid @RequestBody ProductCategory category) {
        productCategoryService.addCategory(category);
        return Result.success("添加成功");
    }

    @PutMapping
    @RequireRole({RoleEnum.ADMIN, RoleEnum.PROCESS_ENGINEER})
    public Result<Void> updateCategory(@Valid @RequestBody ProductCategory category) {
        productCategoryService.updateCategory(category);
        return Result.success("更新成功");
    }

    @PutMapping("/{id}/offline")
    @RequireRole({RoleEnum.ADMIN, RoleEnum.PROCESS_ENGINEER})
    public Result<Void> offlineCategory(@PathVariable Long id) {
        productCategoryService.offlineCategory(id);
        return Result.success("已下线");
    }

    @PutMapping("/{id}/priority")
    @RequireRole({RoleEnum.ADMIN, RoleEnum.PROCESS_ENGINEER})
    public Result<Void> updatePriority(@PathVariable Long id, @RequestParam Integer priority) {
        productCategoryService.updatePriority(id, priority);
        return Result.success("优先级更新成功");
    }

    @GetMapping("/tree")
    public Result<List<CategoryTreeVO>> getCategoryTree() {
        List<CategoryTreeVO> tree = productCategoryService.getCategoryTree();
        return Result.success(tree);
    }

    @GetMapping("/list")
    public Result<List<ProductCategory>> getOnlineCategoryList() {
        List<ProductCategory> list = productCategoryService.getOnlineCategoryList();
        return Result.success(list);
    }

    @GetMapping("/{id}")
    public Result<ProductCategory> getById(@PathVariable Long id) {
        ProductCategory category = productCategoryService.getById(id);
        return Result.success(category);
    }
}
