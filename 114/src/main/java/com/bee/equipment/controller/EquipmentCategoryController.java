package com.bee.equipment.controller;

import com.bee.equipment.annotation.OperationLog;
import com.bee.equipment.annotation.Permission;
import com.bee.equipment.annotation.RequireRole;
import com.bee.equipment.common.PermissionEnum;
import com.bee.equipment.common.Result;
import com.bee.equipment.common.RoleEnum;
import com.bee.equipment.dto.CategoryDTO;
import com.bee.equipment.service.EquipmentCategoryService;
import com.bee.equipment.vo.EquipmentCategoryVO;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/category")
public class EquipmentCategoryController {

    @Autowired
    private EquipmentCategoryService categoryService;

    @GetMapping("/tree")
    @RequireRole({RoleEnum.ADMIN, RoleEnum.ASSEMBLER, RoleEnum.PURCHASER, RoleEnum.OPERATOR})
    @Permission(PermissionEnum.CATEGORY_VIEW)
    public Result<List<EquipmentCategoryVO>> listWithTree() {
        return Result.success(categoryService.listWithTree());
    }

    @GetMapping("/{id}")
    @RequireRole({RoleEnum.ADMIN, RoleEnum.ASSEMBLER, RoleEnum.PURCHASER, RoleEnum.OPERATOR})
    @Permission(PermissionEnum.CATEGORY_VIEW)
    public Result<EquipmentCategoryVO> getById(@PathVariable Long id) {
        return Result.success(categoryService.getCategoryById(id));
    }

    @PostMapping
    @RequireRole(RoleEnum.ADMIN)
    @Permission(PermissionEnum.CATEGORY_ADD)
    @OperationLog(module = "类目管理", description = "新增类目")
    public Result<Void> addCategory(@Valid @RequestBody CategoryDTO categoryDTO) {
        categoryService.addCategory(categoryDTO);
        return Result.success();
    }

    @PutMapping
    @RequireRole(RoleEnum.ADMIN)
    @Permission(PermissionEnum.CATEGORY_EDIT)
    @OperationLog(module = "类目管理", description = "修改类目")
    public Result<Void> updateCategory(@Valid @RequestBody CategoryDTO categoryDTO) {
        categoryService.updateCategory(categoryDTO);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @RequireRole(RoleEnum.ADMIN)
    @Permission(PermissionEnum.CATEGORY_DELETE)
    @OperationLog(module = "类目管理", description = "删除类目")
    public Result<Void> removeCategory(@PathVariable Long id) {
        categoryService.removeCategory(id);
        return Result.success();
    }

    @PutMapping("/{id}/status")
    @RequireRole(RoleEnum.ADMIN)
    @Permission(PermissionEnum.CATEGORY_STATUS)
    @OperationLog(module = "类目管理", description = "修改类目状态")
    public Result<Void> updateStatus(@PathVariable Long id, @RequestParam Integer status) {
        categoryService.updateStatus(id, status);
        return Result.success();
    }
}
