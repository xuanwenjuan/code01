package com.firecontrol.controller;

import com.firecontrol.annotation.OperationLog;
import com.firecontrol.common.Result;
import com.firecontrol.dto.ProductCategoryDTO;
import com.firecontrol.entity.ProductCategory;
import com.firecontrol.service.ProductCategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "产品分类管理", description = "消防产品多级分类管理接口")
@RestController
@RequestMapping("/product/category")
public class ProductCategoryController {

    @Resource
    private ProductCategoryService productCategoryService;

    @Operation(summary = "新增产品分类")
    @OperationLog(module = "产品分类", operation = "新增", description = "新增消防产品分类")
    @PostMapping
    public Result<Void> addCategory(@Valid @RequestBody ProductCategoryDTO dto) {
        productCategoryService.addCategory(dto);
        return Result.success();
    }

    @Operation(summary = "修改产品分类")
    @OperationLog(module = "产品分类", operation = "修改", description = "修改消防产品分类信息")
    @PutMapping
    public Result<Void> updateCategory(@Valid @RequestBody ProductCategoryDTO dto) {
        productCategoryService.updateCategory(dto);
        return Result.success();
    }

    @Operation(summary = "删除产品分类")
    @OperationLog(module = "产品分类", operation = "删除", description = "删除消防产品分类")
    @DeleteMapping("/{id}")
    public Result<Void> deleteCategory(@PathVariable Long id) {
        productCategoryService.deleteCategory(id);
        return Result.success();
    }

    @Operation(summary = "根据ID获取分类详情")
    @GetMapping("/{id}")
    public Result<ProductCategory> getCategoryById(@PathVariable Long id) {
        return Result.success(productCategoryService.getCategoryById(id));
    }

    @Operation(summary = "获取分类树形结构")
    @GetMapping("/tree")
    public Result<List<ProductCategory>> getCategoryTree() {
        return Result.success(productCategoryService.getCategoryTree());
    }

    @Operation(summary = "根据父级ID获取子分类")
    @GetMapping("/children/{parentId}")
    public Result<List<ProductCategory>> getChildrenByParentId(@PathVariable Long parentId) {
        return Result.success(productCategoryService.getChildrenByParentId(parentId));
    }

    @Operation(summary = "调整生产优先级")
    @OperationLog(module = "产品分类", operation = "调整优先级", description = "调整产品生产优先级")
    @PutMapping("/{id}/priority/{priority}")
    public Result<Void> updatePriority(@PathVariable Long id, @PathVariable Integer priority) {
        productCategoryService.updatePriority(id, priority);
        return Result.success();
    }

    @Operation(summary = "更新产品状态（淘汰/启用）")
    @OperationLog(module = "产品分类", operation = "更新状态", description = "更新产品状态，0-淘汰停止排产，1-正常")
    @PutMapping("/{id}/status/{status}")
    public Result<Void> updateStatus(@PathVariable Long id, @PathVariable Integer status) {
        productCategoryService.updateStatus(id, status);
        return Result.success();
    }
}
