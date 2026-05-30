package com.aquascape.controller;

import com.aquascape.annotation.OperationLog;
import com.aquascape.annotation.RequiresRole;
import com.aquascape.common.Result;
import com.aquascape.dto.MaterialCategoryDTO;
import com.aquascape.entity.MaterialCategory;
import com.aquascape.service.MaterialCategoryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/category")
public class MaterialCategoryController {

    @Autowired
    private MaterialCategoryService categoryService;

    @GetMapping("/tree")
    public Result<List<MaterialCategory>> treeList() {
        return Result.success(categoryService.treeList());
    }

    @GetMapping("/hot")
    public Result<List<MaterialCategory>> hotCategories() {
        return Result.success(categoryService.getHotCategories());
    }

    @GetMapping("/{id}")
    @RequiresRole({"ADMIN", "PURCHASER", "WAREHOUSE"})
    public Result<MaterialCategory> getById(@PathVariable Long id) {
        return Result.success(categoryService.getById(id));
    }

    @GetMapping
    @RequiresRole({"ADMIN", "PURCHASER", "WAREHOUSE"})
    public Result<List<MaterialCategory>> list() {
        return Result.success(categoryService.list());
    }

    @PostMapping
    @RequiresRole({"ADMIN", "PURCHASER"})
    @OperationLog(module = "素材类目", operation = "新增类目")
    public Result<Void> create(@Valid @RequestBody MaterialCategoryDTO dto) {
        categoryService.create(dto);
        return Result.success();
    }

    @PutMapping("/{id}")
    @RequiresRole({"ADMIN", "PURCHASER"})
    @OperationLog(module = "素材类目", operation = "编辑类目")
    public Result<Void> update(@PathVariable Long id, @Valid @RequestBody MaterialCategoryDTO dto) {
        categoryService.update(id, dto);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @RequiresRole({"ADMIN"})
    @OperationLog(module = "素材类目", operation = "删除类目")
    public Result<Void> delete(@PathVariable Long id) {
        categoryService.delete(id);
        return Result.success();
    }

    @PutMapping("/{id}/offline")
    @RequiresRole({"ADMIN", "PURCHASER"})
    @OperationLog(module = "素材类目", operation = "类目下架")
    public Result<Void> offline(@PathVariable Long id) {
        categoryService.offline(id);
        return Result.success();
    }

    @PutMapping("/{id}/online")
    @RequiresRole({"ADMIN", "PURCHASER"})
    @OperationLog(module = "素材类目", operation = "类目上架")
    public Result<Void> online(@PathVariable Long id) {
        categoryService.online(id);
        return Result.success();
    }
}
