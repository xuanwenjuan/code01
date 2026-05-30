package com.mining.maintenance.controller;

import com.mining.maintenance.annotation.Log;
import com.mining.maintenance.annotation.RequireRole;
import com.mining.maintenance.common.Result;
import com.mining.maintenance.constant.RoleConstant;
import com.mining.maintenance.dto.EquipmentCategoryDTO;
import com.mining.maintenance.entity.EquipmentCategory;
import com.mining.maintenance.service.EquipmentCategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/equipment/category")
@RequiredArgsConstructor
@RequireRole(RoleConstant.ADMIN)
public class EquipmentCategoryController {

    private final EquipmentCategoryService equipmentCategoryService;

    @PostMapping
    @Log(operationModule = "设备类目", operationType = "新增", operationDesc = "新增设备类目")
    public Result<Void> add(@Valid @RequestBody EquipmentCategoryDTO dto) {
        equipmentCategoryService.addCategory(dto);
        return Result.success();
    }

    @PutMapping
    @Log(operationModule = "设备类目", operationType = "修改", operationDesc = "更新设备类目")
    public Result<Void> update(@Valid @RequestBody EquipmentCategoryDTO dto) {
        equipmentCategoryService.updateCategory(dto);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @Log(operationModule = "设备类目", operationType = "删除", operationDesc = "删除设备类目")
    public Result<Void> delete(@PathVariable Long id) {
        equipmentCategoryService.deleteCategory(id);
        return Result.success();
    }

    @GetMapping("/tree")
    @RequireRole({RoleConstant.ADMIN, RoleConstant.DISPATCHER, RoleConstant.TECHNICIAN, RoleConstant.MATERIAL})
    public Result<List<EquipmentCategory>> treeList() {
        return Result.success(equipmentCategoryService.treeList());
    }

    @GetMapping("/tree/type/{categoryType}")
    @RequireRole({RoleConstant.ADMIN, RoleConstant.DISPATCHER, RoleConstant.TECHNICIAN, RoleConstant.MATERIAL})
    public Result<List<EquipmentCategory>> treeListByType(@PathVariable String categoryType) {
        return Result.success(equipmentCategoryService.treeListByType(categoryType));
    }

    @GetMapping("/{id}")
    @RequireRole({RoleConstant.ADMIN, RoleConstant.DISPATCHER, RoleConstant.TECHNICIAN, RoleConstant.MATERIAL})
    public Result<EquipmentCategory> getById(@PathVariable Long id) {
        return Result.success(equipmentCategoryService.getById(id));
    }

    @PutMapping("/{id}/offline")
    @Log(operationModule = "设备类目", operationType = "修改", operationDesc = "下线设备类目")
    public Result<Void> offline(@PathVariable Long id) {
        equipmentCategoryService.offlineCategory(id);
        return Result.success();
    }

    @PutMapping("/{id}/online")
    @Log(operationModule = "设备类目", operationType = "修改", operationDesc = "上线设备类目")
    public Result<Void> online(@PathVariable Long id) {
        equipmentCategoryService.onlineCategory(id);
        return Result.success();
    }

    @PutMapping("/{id}/sort")
    @Log(operationModule = "设备类目", operationType = "修改", operationDesc = "调整类目排序")
    public Result<Void> updateSort(@PathVariable Long id, @RequestParam Integer sortOrder) {
        equipmentCategoryService.updateSort(id, sortOrder);
        return Result.success();
    }
}