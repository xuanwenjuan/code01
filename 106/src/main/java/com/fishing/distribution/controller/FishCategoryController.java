package com.fishing.distribution.controller;

import com.fishing.distribution.annotation.OperationLogger;
import com.fishing.distribution.common.Result;
import com.fishing.distribution.dto.FishCategoryDTO;
import com.fishing.distribution.entity.FishCategory;
import com.fishing.distribution.service.FishCategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/fish-category")
@RequiredArgsConstructor
public class FishCategoryController {

    private final FishCategoryService fishCategoryService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @OperationLogger(module = "渔获类目", type = "新增", desc = "新增渔获类目")
    public Result<Void> addCategory(@Valid @RequestBody FishCategoryDTO dto) {
        fishCategoryService.addCategory(dto);
        return Result.success("添加成功");
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @OperationLogger(module = "渔获类目", type = "修改", desc = "修改渔获类目")
    public Result<Void> updateCategory(@PathVariable Long id, @Valid @RequestBody FishCategoryDTO dto) {
        fishCategoryService.updateCategory(id, dto);
        return Result.success("更新成功");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @OperationLogger(module = "渔获类目", type = "删除", desc = "删除渔获类目")
    public Result<Void> deleteCategory(@PathVariable Long id) {
        fishCategoryService.deleteCategory(id);
        return Result.success("删除成功");
    }

    @GetMapping("/{id}")
    public Result<FishCategory> getCategoryById(@PathVariable Long id) {
        return Result.success(fishCategoryService.getCategoryById(id));
    }

    @GetMapping("/tree")
    public Result<List<FishCategory>> getCategoryTree(
            @RequestParam(required = false) String categoryType) {
        return Result.success(fishCategoryService.getCategoryTree(categoryType));
    }

    @GetMapping("/list")
    public Result<List<FishCategory>> getCategoryList(
            @RequestParam(required = false) String categoryType,
            @RequestParam(required = false) Integer status) {
        return Result.success(fishCategoryService.getCategoryList(categoryType, status));
    }

    @GetMapping("/hot")
    public Result<List<FishCategory>> getHotCategories() {
        return Result.success(fishCategoryService.getHotCategories());
    }
}
