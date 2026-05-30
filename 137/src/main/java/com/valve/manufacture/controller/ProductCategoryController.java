package com.valve.manufacture.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.valve.manufacture.annotation.RequiresRole;
import com.valve.manufacture.common.Result;
import com.valve.manufacture.constant.RoleConstants;
import com.valve.manufacture.entity.ProductCategory;
import com.valve.manufacture.service.ProductCategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/product-categories")
@RequiredArgsConstructor
@RequiresRole({RoleConstants.ADMIN, RoleConstants.PROCESS})
public class ProductCategoryController {

    private final ProductCategoryService productCategoryService;

    @GetMapping("/tree")
    public Result<List<ProductCategory>> tree() {
        List<ProductCategory> tree = productCategoryService.tree();
        return Result.success(tree);
    }

    @GetMapping
    public Result<Page<ProductCategory>> page(
            @RequestParam(defaultValue = "1") Integer current,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String categoryName) {
        LambdaQueryWrapper<ProductCategory> wrapper = new LambdaQueryWrapper<>();
        if (categoryName != null && !categoryName.isEmpty()) {
            wrapper.like(ProductCategory::getCategoryName, categoryName);
        }
        wrapper.eq(ProductCategory::getDeleted, 0);
        wrapper.orderByAsc(ProductCategory::getPriority);

        Page<ProductCategory> page = productCategoryService.page(new Page<>(current, size), wrapper);
        return Result.success(page);
    }

    @GetMapping("/{id}")
    public Result<ProductCategory> getById(@PathVariable Long id) {
        ProductCategory category = productCategoryService.getById(id);
        return Result.success(category);
    }

    @GetMapping("/parent/{parentId}")
    public Result<List<ProductCategory>> getByParentId(@PathVariable Long parentId) {
        List<ProductCategory> categories = productCategoryService.getByParentId(parentId);
        return Result.success(categories);
    }

    @PostMapping
    public Result<ProductCategory> create(@Valid @RequestBody ProductCategory category) {
        ProductCategory created = productCategoryService.create(category);
        return Result.success("创建成功", created);
    }

    @PutMapping("/{id}")
    public Result<ProductCategory> update(@PathVariable Long id, @Valid @RequestBody ProductCategory category) {
        ProductCategory updated = productCategoryService.update(id, category);
        return Result.success("更新成功", updated);
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        productCategoryService.delete(id);
        return Result.success("删除成功");
    }
}
