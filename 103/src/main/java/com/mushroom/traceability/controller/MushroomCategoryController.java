package com.mushroom.traceability.controller;

import com.mushroom.traceability.annotation.RequiresRole;
import com.mushroom.traceability.common.Constants;
import com.mushroom.traceability.common.Result;
import com.mushroom.traceability.entity.MushroomCategory;
import com.mushroom.traceability.service.MushroomCategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class MushroomCategoryController {

    private final MushroomCategoryService categoryService;

    @GetMapping("/tree")
    public Result<List<MushroomCategory>> treeList() {
        return Result.success(categoryService.treeList());
    }

    @GetMapping("/tree/type/{categoryType}")
    public Result<List<MushroomCategory>> treeListByType(@PathVariable String categoryType) {
        return Result.success(categoryService.treeListByType(categoryType));
    }

    @GetMapping("/{id}")
    public Result<MushroomCategory> getById(@PathVariable Long id) {
        return Result.success(categoryService.getById(id));
    }

    @PostMapping
    @RequiresRole({Constants.ROLE_OPERATOR, Constants.ROLE_ADMIN})
    public Result<Void> create(@Valid @RequestBody MushroomCategory category) {
        categoryService.save(category);
        return Result.success();
    }

    @PutMapping
    @RequiresRole({Constants.ROLE_OPERATOR, Constants.ROLE_ADMIN})
    public Result<Void> update(@Valid @RequestBody MushroomCategory category) {
        categoryService.updateById(category);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @RequiresRole({Constants.ROLE_ADMIN})
    public Result<Void> delete(@PathVariable Long id) {
        categoryService.removeById(id);
        return Result.success();
    }

    @PutMapping("/{id}/forbidden")
    @RequiresRole({Constants.ROLE_OPERATOR, Constants.ROLE_ADMIN})
    public Result<Void> toggleForbidden(@PathVariable Long id) {
        categoryService.toggleForbidden(id);
        return Result.success();
    }

    @PutMapping("/{id}/status")
    @RequiresRole({Constants.ROLE_OPERATOR, Constants.ROLE_ADMIN})
    public Result<Void> toggleStatus(@PathVariable Long id) {
        categoryService.toggleStatus(id);
        return Result.success();
    }
}