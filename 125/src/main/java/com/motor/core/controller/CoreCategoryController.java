package com.motor.core.controller;

import com.motor.core.annotation.OperationLog;
import com.motor.core.annotation.RequiresRole;
import com.motor.core.common.Result;
import com.motor.core.constants.RoleConstants;
import com.motor.core.entity.po.CoreCategoryPO;
import com.motor.core.service.CoreCategoryService;
import com.motor.core.vo.CoreCategoryVO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/category")
@RequiredArgsConstructor
public class CoreCategoryController {
    private final CoreCategoryService coreCategoryService;

    @GetMapping("/tree")
    @OperationLog(module = "分类管理", operation = "查询分类树", description = "获取铁芯分类树结构")
    public Result<List<CoreCategoryVO>> getCategoryTree() {
        return Result.success(coreCategoryService.getCategoryTree());
    }

    @GetMapping("/list")
    @OperationLog(module = "分类管理", operation = "查询分类列表", description = "获取铁芯分类列表")
    public Result<List<CoreCategoryVO>> getCategoryList() {
        return Result.success(coreCategoryService.getCategoryList());
    }

    @GetMapping("/{id}")
    @OperationLog(module = "分类管理", operation = "查询详情", description = "根据ID查询分类详情")
    public Result<CoreCategoryVO> getById(@PathVariable Long id) {
        return Result.success(coreCategoryService.getCategoryById(id));
    }

    @PostMapping
    @RequiresRole({RoleConstants.PROCESS_ENGINEER, RoleConstants.PRODUCTION_LEADER})
    @OperationLog(module = "分类管理", operation = "新增分类", description = "新增铁芯分类")
    public Result<Void> create(@RequestBody CoreCategoryPO category) {
        boolean success = coreCategoryService.createCategory(category);
        return success ? Result.success() : Result.error("创建失败");
    }

    @PutMapping
    @RequiresRole({RoleConstants.PROCESS_ENGINEER, RoleConstants.PRODUCTION_LEADER})
    @OperationLog(module = "分类管理", operation = "更新分类", description = "更新铁芯分类")
    public Result<Void> update(@RequestBody CoreCategoryPO category) {
        boolean success = coreCategoryService.updateCategory(category);
        return success ? Result.success() : Result.error("更新失败");
    }

    @DeleteMapping("/{id}")
    @RequiresRole({RoleConstants.PROCESS_ENGINEER, RoleConstants.PRODUCTION_LEADER})
    @OperationLog(module = "分类管理", operation = "删除分类", description = "删除铁芯分类")
    public Result<Void> delete(@PathVariable Long id) {
        boolean success = coreCategoryService.deleteCategory(id);
        return success ? Result.success() : Result.error("删除失败");
    }

    @PutMapping("/{id}/status/{status}")
    @RequiresRole({RoleConstants.PROCESS_ENGINEER, RoleConstants.PRODUCTION_LEADER})
    @OperationLog(module = "分类管理", operation = "更新状态", description = "更新铁芯分类状态")
    public Result<Void> updateStatus(@PathVariable Long id, @PathVariable Integer status) {
        boolean success = coreCategoryService.updateStatus(id, status);
        return success ? Result.success() : Result.error("状态更新失败");
    }
}
