package com.bearing.production.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.bearing.production.annotation.OperationLog;
import com.bearing.production.annotation.RequiresRole;
import com.bearing.production.common.Result;
import com.bearing.production.entity.BearingCategory;
import com.bearing.production.enums.RoleEnum;
import com.bearing.production.service.BearingCategoryService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/category")
@RequiredArgsConstructor
public class BearingCategoryController {

    private final BearingCategoryService categoryService;

    @PostMapping
    @RequiresRole({RoleEnum.ADMIN_CODE, RoleEnum.PROCESS_ENGINEER_CODE})
    @OperationLog(module = "轴承品类管理", description = "新增轴承品类")
    public Result<Void> addCategory(@Valid @RequestBody BearingCategory category) {
        categoryService.addCategory(category);
        return Result.success("新增成功", null);
    }

    @PutMapping("/{id}")
    @RequiresRole({RoleEnum.ADMIN_CODE, RoleEnum.PROCESS_ENGINEER_CODE})
    @OperationLog(module = "轴承品类管理", description = "更新轴承品类")
    public Result<Void> updateCategory(@PathVariable @NotNull Long id, @Valid @RequestBody BearingCategory category) {
        category.setId(id);
        categoryService.updateCategory(category);
        return Result.success("更新成功", null);
    }

    @DeleteMapping("/{id}")
    @RequiresRole({RoleEnum.ADMIN_CODE})
    @OperationLog(module = "轴承品类管理", description = "删除轴承品类")
    public Result<Void> deleteCategory(@PathVariable @NotNull Long id) {
        categoryService.deleteCategory(id);
        return Result.success("删除成功", null);
    }

    @PutMapping("/{id}/offline")
    @RequiresRole({RoleEnum.ADMIN_CODE, RoleEnum.PROCESS_ENGINEER_CODE})
    @OperationLog(module = "轴承品类管理", description = "品类下线")
    public Result<Void> offlineCategory(@PathVariable @NotNull Long id) {
        categoryService.offlineCategory(id);
        return Result.success("下线成功，该品类下所有子品类已同时下线");
    }

    @PutMapping("/{id}/priority")
    @RequiresRole({RoleEnum.ADMIN_CODE, RoleEnum.PROCESS_ENGINEER_CODE})
    @OperationLog(module = "轴承品类管理", description = "调整生产优先级")
    public Result<Void> updatePriority(@PathVariable @NotNull Long id, @RequestParam @NotNull Integer priority) {
        categoryService.updatePriority(id, priority);
        return Result.success("优先级调整成功", null);
    }

    @GetMapping("/{id}")
    public Result<BearingCategory> getById(@PathVariable @NotNull Long id) {
        BearingCategory category = categoryService.getById(id);
        return Result.success("查询成功", category);
    }

    @GetMapping("/tree")
    public Result<List<BearingCategory>> getTree() {
        List<BearingCategory> tree = categoryService.getTree();
        return Result.success("查询成功", tree);
    }

    @GetMapping("/level/{level}")
    public Result<List<BearingCategory>> getByLevel(@PathVariable @NotNull Integer level) {
        List<BearingCategory> list = categoryService.getByLevel(level);
        return Result.success("查询成功", list);
    }

    @GetMapping("/active/list")
    public Result<List<BearingCategory>> getActiveCategories() {
        List<BearingCategory> list = categoryService.getActiveCategories();
        return Result.success("查询成功", list);
    }
}
