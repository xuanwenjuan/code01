package com.ancientpaper.controller;

import com.ancientpaper.annotation.Log;
import com.ancientpaper.annotation.RequiresRole;
import com.ancientpaper.common.Result;
import com.ancientpaper.dto.CategoryDTO;
import com.ancientpaper.entity.PaperCategory;
import com.ancientpaper.service.PaperCategoryService;
import com.ancientpaper.vo.CategoryTreeVO;
import com.ancientpaper.validation.CreateGroup;
import com.ancientpaper.validation.UpdateGroup;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/category")
@RequiredArgsConstructor
@Validated
public class PaperCategoryController {

    private final PaperCategoryService categoryService;

    @GetMapping("/tree")
    public Result<List<CategoryTreeVO>> getCategoryTree() {
        return Result.success(categoryService.getCategoryTree());
    }

    @GetMapping("/hot")
    public Result<List<CategoryTreeVO>> getHotCategories() {
        return Result.success(categoryService.getHotCategories());
    }

    @PostMapping
    @RequiresRole({4})
    @Log(module = "纸品分类", type = "新增", desc = "新增纸品分类")
    public Result<Void> addCategory(@Validated(CreateGroup.class) @RequestBody CategoryDTO dto) {
        categoryService.addCategory(dto);
        return Result.success();
    }

    @PutMapping
    @RequiresRole({4})
    @Log(module = "纸品分类", type = "修改", desc = "修改纸品分类")
    public Result<Void> updateCategory(@Validated(UpdateGroup.class) @RequestBody CategoryDTO dto) {
        categoryService.updateCategory(dto);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @RequiresRole({4})
    @Log(module = "纸品分类", type = "删除", desc = "删除纸品分类")
    public Result<Void> deleteCategory(@PathVariable @Positive(message = "分类ID必须大于0") Long id) {
        categoryService.deleteCategory(id);
        return Result.success();
    }

    @GetMapping("/children/{parentId}")
    public Result<List<PaperCategory>> getChildCategories(@PathVariable Long parentId) {
        return Result.success(categoryService.getChildCategories(parentId));
    }
}
