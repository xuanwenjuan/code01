package com.construction.material.controller;

import com.construction.material.annotation.OperationLog;
import com.construction.material.annotation.RequiresRole;
import com.construction.material.common.PageQuery;
import com.construction.material.common.PageResult;
import com.construction.material.common.Result;
import com.construction.material.dto.MaterialCategoryDTO;
import com.construction.material.entity.MaterialCategory;
import com.construction.material.service.MaterialCategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/category")
@RequiredArgsConstructor
public class MaterialCategoryController {

    private final MaterialCategoryService categoryService;

    @PostMapping
    @RequiresRole({"ADMIN", "PURCHASER"})
    @OperationLog(module = "品类分类模块", operation = "新增品类", description = "新增建材品类分类")
    public Result<Void> addCategory(@Valid @RequestBody MaterialCategoryDTO dto) {
        categoryService.addCategory(dto);
        return Result.success();
    }

    @PutMapping
    @RequiresRole({"ADMIN", "PURCHASER"})
    @OperationLog(module = "品类分类模块", operation = "更新品类", description = "更新建材品类分类信息")
    public Result<Void> updateCategory(@Valid @RequestBody MaterialCategoryDTO dto) {
        categoryService.updateCategory(dto);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @RequiresRole({"ADMIN"})
    @OperationLog(module = "品类分类模块", operation = "删除品类", description = "删除建材品类分类")
    public Result<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return Result.success();
    }

    @GetMapping("/{id}")
    public Result<MaterialCategory> getCategory(@PathVariable Long id) {
        return Result.success(categoryService.getCategory(id));
    }

    @GetMapping("/page")
    public Result<PageResult<MaterialCategory>> getCategoryPage(PageQuery pageQuery) {
        return Result.success(categoryService.getCategoryPage(pageQuery));
    }

    @GetMapping("/tree")
    public Result<List<MaterialCategory>> getCategoryTree() {
        return Result.success(categoryService.getCategoryTree());
    }

    @GetMapping("/children/{parentId}")
    public Result<List<MaterialCategory>> getChildrenByParentId(@PathVariable Long parentId) {
        return Result.success(categoryService.getChildrenByParentId(parentId));
    }

    @PutMapping("/disable/{id}")
    @RequiresRole({"ADMIN", "PURCHASER"})
    @OperationLog(module = "品类分类模块", operation = "停用品类", description = "停用建材品类分类")
    public Result<Void> disableCategory(@PathVariable Long id) {
        categoryService.disableCategory(id);
        return Result.success();
    }

    @PutMapping("/enable/{id}")
    @RequiresRole({"ADMIN", "PURCHASER"})
    @OperationLog(module = "品类分类模块", operation = "启用品类", description = "启用建材品类分类")
    public Result<Void> enableCategory(@PathVariable Long id) {
        categoryService.enableCategory(id);
        return Result.success();
    }
}
