package com.instrument.consignment.controller;

import com.instrument.consignment.annotation.RequiresRole;
import com.instrument.consignment.common.Result;
import com.instrument.consignment.dto.CategoryDTO;
import com.instrument.consignment.entity.InstrumentCategory;
import com.instrument.consignment.enums.UserRoleEnum;
import com.instrument.consignment.service.InstrumentCategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final InstrumentCategoryService categoryService;

    @PostMapping
    @RequiresRole({UserRoleEnum.ADMIN})
    public Result<Void> addCategory(@Valid @RequestBody CategoryDTO categoryDTO) {
        categoryService.addCategory(categoryDTO);
        return Result.success();
    }

    @PutMapping
    @RequiresRole({UserRoleEnum.ADMIN})
    public Result<Void> updateCategory(@Valid @RequestBody CategoryDTO categoryDTO) {
        categoryService.updateCategory(categoryDTO);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @RequiresRole({UserRoleEnum.ADMIN})
    public Result<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return Result.success();
    }

    @GetMapping("/{id}")
    public Result<InstrumentCategory> getCategoryById(@PathVariable Long id) {
        return Result.success(categoryService.getCategoryById(id));
    }

    @GetMapping("/tree")
    public Result<List<InstrumentCategory>> getCategoryTree() {
        return Result.success(categoryService.getCategoryTree());
    }

    @GetMapping("/type/{categoryType}")
    public Result<List<InstrumentCategory>> getCategoryByType(@PathVariable String categoryType) {
        return Result.success(categoryService.getCategoryByType(categoryType));
    }

    @PutMapping("/{id}/status")
    public Result<Void> updateCategoryStatus(@PathVariable Long id, @RequestParam Integer status) {
        categoryService.updateCategoryStatus(id, status);
        return Result.success();
    }

    @GetMapping("/hot")
    public Result<List<InstrumentCategory>> getHotCategories() {
        return Result.success(categoryService.getHotCategories());
    }
}
