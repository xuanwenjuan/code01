package com.aromatherapy.controller;

import com.aromatherapy.annotation.RequiresPermission;
import com.aromatherapy.annotation.RequiresRole;
import com.aromatherapy.common.Result;
import com.aromatherapy.entity.AromaCategory;
import com.aromatherapy.service.AromaCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/category")
@RequiredArgsConstructor
public class AromaCategoryController {

    private final AromaCategoryService categoryService;

    @GetMapping("/tree")
    @RequiresPermission("category:read")
    public Result<List<AromaCategory>> treeList() {
        return Result.success(categoryService.treeList());
    }

    @GetMapping("/supply-sorted")
    @RequiresPermission("category:read")
    public Result<List<AromaCategory>> getSupplySortedList() {
        return Result.success(categoryService.getSupplySortedList());
    }

    @GetMapping("/hot")
    @RequiresPermission("category:read")
    public Result<List<AromaCategory>> getHotCategories() {
        return Result.success(categoryService.getHotCategories());
    }

    @GetMapping("/{id}")
    @RequiresPermission("category:read")
    public Result<AromaCategory> getById(@PathVariable Long id) {
        return Result.success(categoryService.getById(id));
    }

    @PostMapping
    @RequiresPermission("category:write")
    public Result<Void> create(@RequestBody AromaCategory category) {
        categoryService.create(category);
        return Result.success();
    }

    @PutMapping
    @RequiresPermission("category:write")
    public Result<Void> update(@RequestBody AromaCategory category) {
        categoryService.update(category);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @RequiresRole({"ADMIN"})
    public Result<Void> delete(@PathVariable Long id) {
        categoryService.delete(id);
        return Result.success();
    }

    @PutMapping("/{id}/status")
    @RequiresPermission("category:write")
    public Result<Void> updateStatus(@PathVariable Long id, @RequestParam Integer status) {
        categoryService.updateStatus(id, status);
        return Result.success();
    }

    @PutMapping("/{id}/supply-sort")
    @RequiresPermission("category:write")
    public Result<Void> updateSupplySort(@PathVariable Long id, @RequestParam Integer supplySort) {
        categoryService.updateSupplySort(id, supplySort);
        return Result.success();
    }

    @GetMapping("/tree-all")
    @RequiresRole({"ADMIN"})
    public Result<List<AromaCategory>> treeListWithAllStatus() {
        return Result.success(categoryService.treeListWithAllStatus());
    }

    @DeleteMapping("/cache")
    @RequiresRole({"ADMIN"})
    public Result<Void> clearCache() {
        categoryService.clearCache();
        return Result.success();
    }
}
