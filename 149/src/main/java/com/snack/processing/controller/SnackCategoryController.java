package com.snack.processing.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.snack.processing.common.Result;
import com.snack.processing.dto.category.CategoryAddDTO;
import com.snack.processing.dto.category.CategoryQueryDTO;
import com.snack.processing.entity.SnackCategory;
import com.snack.processing.service.SnackCategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/category")
@RequiredArgsConstructor
@Tag(name = "零食品类管理", description = "零食品类的增删改查、树形结构查询")
public class SnackCategoryController {

    private final SnackCategoryService categoryService;

    @PostMapping
    @Operation(summary = "新增品类")
    public Result<Void> addCategory(@Valid @RequestBody CategoryAddDTO dto) {
        return categoryService.addCategory(dto);
    }

    @PutMapping("/{id}")
    @Operation(summary = "更新品类")
    public Result<Void> updateCategory(@PathVariable Long id, @Valid @RequestBody CategoryAddDTO dto) {
        return categoryService.updateCategory(id, dto);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除品类")
    public Result<Void> deleteCategory(@PathVariable Long id) {
        return categoryService.deleteCategory(id);
    }

    @PutMapping("/{id}/disable")
    @Operation(summary = "淘汰停用品类")
    public Result<Void> disableCategory(@PathVariable Long id) {
        return categoryService.disableCategory(id);
    }

    @PutMapping("/{id}/enable")
    @Operation(summary = "启用品类")
    public Result<Void> enableCategory(@PathVariable Long id) {
        return categoryService.enableCategory(id);
    }

    @GetMapping("/{id}")
    @Operation(summary = "根据ID获取品类详情")
    public Result<SnackCategory> getCategoryById(@PathVariable Long id) {
        return categoryService.getCategoryById(id);
    }

    @GetMapping("/page")
    @Operation(summary = "分页查询品类列表")
    public Result<IPage<SnackCategory>> getCategoryPage(CategoryQueryDTO dto) {
        return categoryService.getCategoryPage(dto);
    }

    @GetMapping("/tree")
    @Operation(summary = "获取无限级树形结构")
    public Result<List<SnackCategory>> getCategoryTree() {
        return categoryService.getCategoryTree();
    }

    @GetMapping("/parent/{parentId}")
    @Operation(summary = "根据父级ID获取子分类列表")
    public Result<List<SnackCategory>> getChildrenByParentId(@PathVariable Long parentId) {
        return categoryService.getChildrenByParentId(parentId);
    }
}
