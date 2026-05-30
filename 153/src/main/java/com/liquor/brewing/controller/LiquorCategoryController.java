package com.liquor.brewing.controller;

import com.liquor.brewing.common.Result;
import com.liquor.brewing.entity.LiquorCategory;
import com.liquor.brewing.service.LiquorCategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "酒水分类管理", description = "酒水品类分类管理接口")
@RestController
@RequestMapping("/category")
public class LiquorCategoryController {

    @Resource
    private LiquorCategoryService categoryService;

    @Operation(summary = "获取分类树形结构")
    @GetMapping("/tree")
    public Result<List<LiquorCategory>> tree() {
        return Result.success(categoryService.tree());
    }

    @Operation(summary = "获取分类详情")
    @GetMapping("/{id}")
    public Result<LiquorCategory> getById(@PathVariable Long id) {
        return Result.success(categoryService.getById(id));
    }

    @Operation(summary = "新增分类")
    @PostMapping
    public Result<Void> add(@RequestBody LiquorCategory category) {
        categoryService.add(category);
        return Result.success();
    }

    @Operation(summary = "修改分类")
    @PutMapping
    public Result<Void> update(@RequestBody LiquorCategory category) {
        categoryService.update(category);
        return Result.success();
    }

    @Operation(summary = "删除分类")
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        categoryService.delete(id);
        return Result.success();
    }

    @Operation(summary = "修改分类状态")
    @PutMapping("/{id}/status")
    public Result<Void> updateStatus(@PathVariable Long id, @RequestParam Integer status) {
        categoryService.updateStatus(id, status);
        return Result.success();
    }
}
