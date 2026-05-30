package com.evparts.controller;

import com.evparts.annotation.OperationLog;
import com.evparts.annotation.RequireRole;
import com.evparts.common.Result;
import com.evparts.dto.ProductCategoryDTO;
import com.evparts.entity.ProductCategory;
import com.evparts.service.ProductCategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "产品分类管理", description = "配件产品分类的增删改查、树形查询")
@RestController
@RequestMapping("/product-category")
@RequireRole({"PROCESS", "ADMIN"})
public class ProductCategoryController {

    @Autowired
    private ProductCategoryService categoryService;

    @Operation(summary = "获取分类树形结构")
    @GetMapping("/tree")
    public Result<List<ProductCategory>> getTree() {
        return Result.success(categoryService.getTree());
    }

    @Operation(summary = "获取分类列表")
    @GetMapping("/list")
    public Result<List<ProductCategory>> getList() {
        return Result.success(categoryService.getList());
    }

    @Operation(summary = "根据父ID获取子分类")
    @GetMapping("/list/{parentId}")
    public Result<List<ProductCategory>> getByParentId(@PathVariable Long parentId) {
        return Result.success(categoryService.getByParentId(parentId));
    }

    @Operation(summary = "获取分类详情")
    @GetMapping("/{id}")
    public Result<ProductCategory> getById(@PathVariable Long id) {
        return Result.success(categoryService.getById(id));
    }

    @Operation(summary = "新增分类")
    @OperationLog(operation = "新增产品分类")
    @PostMapping
    public Result<Void> add(@Valid @RequestBody ProductCategoryDTO dto) {
        categoryService.add(dto);
        return Result.success();
    }

    @Operation(summary = "修改分类")
    @OperationLog(operation = "修改产品分类")
    @PutMapping
    public Result<Void> update(@Valid @RequestBody ProductCategoryDTO dto) {
        categoryService.update(dto);
        return Result.success();
    }

    @Operation(summary = "删除分类")
    @OperationLog(operation = "删除产品分类")
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        categoryService.delete(id);
        return Result.success();
    }

}
