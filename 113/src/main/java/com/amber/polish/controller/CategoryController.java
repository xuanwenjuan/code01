package com.amber.polish.controller;

import com.amber.polish.annotation.OperationLog;
import com.amber.polish.common.Result;
import com.amber.polish.entity.Category;
import com.amber.polish.service.CategoryService;
import com.amber.polish.vo.CategoryTreeVO;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/category")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping("/tree")
    @OperationLog(module = "品类管理", type = "查询", description = "获取品类树形结构")
    public Result<List<CategoryTreeVO>> getCategoryTree() {
        List<CategoryTreeVO> tree = categoryService.getCategoryTree();
        return Result.success(tree);
    }

    @GetMapping("/hot-tree")
    @OperationLog(module = "品类管理", type = "查询", description = "获取热门品类树形结构")
    public Result<List<CategoryTreeVO>> getHotCategoryTree() {
        List<CategoryTreeVO> tree = categoryService.getHotCategoryTree();
        return Result.success(tree);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PURCHASER')")
    @OperationLog(module = "品类管理", type = "新增", description = "新增品类")
    public Result<Void> addCategory(@RequestBody Category category) {
        categoryService.addCategory(category);
        return Result.success();
    }

    @PutMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PURCHASER')")
    @OperationLog(module = "品类管理", type = "修改", description = "修改品类信息")
    public Result<Void> updateCategory(@RequestBody Category category) {
        categoryService.updateCategory(category);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PURCHASER')")
    @OperationLog(module = "品类管理", type = "删除", description = "删除品类")
    public Result<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return Result.success();
    }

    @GetMapping("/{id}")
    @OperationLog(module = "品类管理", type = "查询", description = "获取品类详情")
    public Result<Category> getCategoryById(@PathVariable Long id) {
        Category category = categoryService.getById(id);
        return Result.success(category);
    }

    @GetMapping("/list")
    @OperationLog(module = "品类管理", type = "查询", description = "获取品类列表")
    public Result<List<Category>> getCategoryList() {
        List<Category> list = categoryService.list();
        return Result.success(list);
    }
}
