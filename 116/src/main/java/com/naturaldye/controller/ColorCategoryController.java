package com.naturaldye.controller;

import com.naturaldye.annotation.RequiresRole;
import com.naturaldye.common.Result;
import com.naturaldye.dto.CategoryTreeDTO;
import com.naturaldye.entity.ColorCategory;
import com.naturaldye.enums.UserRoleEnum;
import com.naturaldye.service.ColorCategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/category")
@RequiredArgsConstructor
public class ColorCategoryController {

    private final ColorCategoryService colorCategoryService;

    @PostMapping
    @RequiresRole({UserRoleEnum.ADMIN})
    public Result<Void> addCategory(@Valid @RequestBody ColorCategory category) {
        colorCategoryService.addCategory(category);
        return Result.success();
    }

    @PutMapping
    @RequiresRole({UserRoleEnum.ADMIN})
    public Result<Void> updateCategory(@Valid @RequestBody ColorCategory category) {
        colorCategoryService.updateCategory(category);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @RequiresRole({UserRoleEnum.ADMIN})
    public Result<Void> deleteCategory(@PathVariable Long id) {
        colorCategoryService.deleteCategory(id);
        return Result.success();
    }

    @PutMapping("/{id}/discontinue")
    @RequiresRole({UserRoleEnum.ADMIN})
    public Result<Void> discontinueCategory(@PathVariable Long id) {
        colorCategoryService.discontinueCategory(id);
        return Result.success();
    }

    @GetMapping("/tree")
    @RequiresRole({UserRoleEnum.ADMIN, UserRoleEnum.DYE_MASTER, UserRoleEnum.FABRIC_PURCHASER, UserRoleEnum.WORKSHOP_MANAGER})
    public Result<List<CategoryTreeDTO>> getCategoryTree() {
        List<CategoryTreeDTO> tree = colorCategoryService.getCategoryTree();
        return Result.success(tree);
    }

    @GetMapping("/tree/active")
    public Result<List<CategoryTreeDTO>> getActiveCategoryTree() {
        List<CategoryTreeDTO> tree = colorCategoryService.getActiveCategoryTree();
        return Result.success(tree);
    }

    @GetMapping("/hot")
    @RequiresRole({UserRoleEnum.ADMIN, UserRoleEnum.DYE_MASTER, UserRoleEnum.FABRIC_PURCHASER, UserRoleEnum.WORKSHOP_MANAGER})
    public Result<List<ColorCategory>> getHotCategories(@RequestParam(defaultValue = "10") int topN) {
        List<ColorCategory> hotCategories = colorCategoryService.getHotCategories(topN);
        return Result.success(hotCategories);
    }

    @GetMapping("/{id}")
    @RequiresRole({UserRoleEnum.ADMIN, UserRoleEnum.DYE_MASTER, UserRoleEnum.FABRIC_PURCHASER, UserRoleEnum.WORKSHOP_MANAGER})
    public Result<ColorCategory> getCategoryById(@PathVariable Long id) {
        ColorCategory category = colorCategoryService.getCategoryById(id);
        return Result.success(category);
    }
}
