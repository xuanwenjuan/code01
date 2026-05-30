package com.spring.manufacturing.controller;

import com.spring.manufacturing.annotation.OperationLog;
import com.spring.manufacturing.annotation.RequiresRole;
import com.spring.manufacturing.common.Result;
import com.spring.manufacturing.entity.SpringCategory;
import com.spring.manufacturing.service.SpringCategoryService;
import com.spring.manufacturing.vo.CategoryTreeVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/category")
@RequiredArgsConstructor
public class SpringCategoryController {

    private final SpringCategoryService springCategoryService;

    @GetMapping("/tree")
    public Result<List<CategoryTreeVO>> getCategoryTree() {
        List<CategoryTreeVO> tree = springCategoryService.getCategoryTree();
        return Result.success(tree);
    }

    @GetMapping("/{id}")
    public Result<SpringCategory> getCategoryById(@PathVariable Long id) {
        SpringCategory category = springCategoryService.getById(id);
        return Result.success(category);
    }

    @PostMapping
    @RequiresRole({"ADMIN", "LEADER"})
    @OperationLog(module = "分类管理", type = "新增", description = "新增产品分类")
    public Result<Void> addCategory(@Valid @RequestBody SpringCategory category) {
        springCategoryService.addCategory(category);
        return Result.success("添加成功", null);
    }

    @PutMapping
    @RequiresRole({"ADMIN", "LEADER"})
    @OperationLog(module = "分类管理", type = "更新", description = "更新产品分类")
    public Result<Void> updateCategory(@Valid @RequestBody SpringCategory category) {
        springCategoryService.updateCategory(category);
        return Result.success("更新成功", null);
    }

    @DeleteMapping("/{id}")
    @RequiresRole({"ADMIN"})
    @OperationLog(module = "分类管理", type = "删除", description = "删除产品分类")
    public Result<Void> deleteCategory(@PathVariable Long id) {
        springCategoryService.deleteCategory(id);
        return Result.success("删除成功", null);
    }

    @PutMapping("/offline/{id}")
    @RequiresRole({"ADMIN", "LEADER"})
    @OperationLog(module = "分类管理", type = "下线", description = "下线产品分类")
    public Result<Void> offlineCategory(@PathVariable Long id) {
        springCategoryService.offlineCategory(id);
        return Result.success("已下线", null);
    }
}