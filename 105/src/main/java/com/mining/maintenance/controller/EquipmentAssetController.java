package com.mining.maintenance.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.mining.maintenance.annotation.Log;
import com.mining.maintenance.annotation.RequireRole;
import com.mining.maintenance.common.Result;
import com.mining.maintenance.constant.RoleConstant;
import com.mining.maintenance.dto.EquipmentAssetDTO;
import com.mining.maintenance.entity.EquipmentAsset;
import com.mining.maintenance.service.EquipmentAssetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/equipment/asset")
@RequiredArgsConstructor
public class EquipmentAssetController {

    private final EquipmentAssetService equipmentAssetService;

    @PostMapping
    @RequireRole(RoleConstant.ADMIN_AND_DISPATCHER)
    @Log(operationModule = "设备资产", operationType = "新增", operationDesc = "创建设备档案")
    public Result<Void> add(@Valid @RequestBody EquipmentAssetDTO dto) {
        equipmentAssetService.addEquipment(dto);
        return Result.success();
    }

    @PutMapping
    @RequireRole(RoleConstant.ADMIN_AND_DISPATCHER)
    @Log(operationModule = "设备资产", operationType = "修改", operationDesc = "更新设备档案")
    public Result<Void> update(@Valid @RequestBody EquipmentAssetDTO dto) {
        equipmentAssetService.updateEquipment(dto);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @RequireRole(RoleConstant.ADMIN)
    @Log(operationModule = "设备资产", operationType = "删除", operationDesc = "删除设备档案")
    public Result<Void> delete(@PathVariable Long id) {
        equipmentAssetService.deleteEquipment(id);
        return Result.success();
    }

    @GetMapping("/{id}")
    @RequireRole(RoleConstant.ALL_ROLES)
    public Result<EquipmentAsset> getById(@PathVariable Long id) {
        return Result.success(equipmentAssetService.getById(id));
    }

    @GetMapping("/page")
    @RequireRole(RoleConstant.ALL_ROLES)
    public Result<Page<EquipmentAsset>> page(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String miningArea,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword) {
        return Result.success(equipmentAssetService.pageQuery(page, size, miningArea, status, keyword));
    }

    @GetMapping("/warning")
    @RequireRole({RoleConstant.ADMIN, RoleConstant.DISPATCHER, RoleConstant.TECHNICIAN})
    public Result<List<EquipmentAsset>> warningList() {
        return Result.success(equipmentAssetService.getWarningList());
    }

    @PutMapping("/{id}/status")
    @RequireRole(RoleConstant.ADMIN_AND_DISPATCHER)
    public Result<Void> updateStatus(@PathVariable Long id, @RequestParam String status) {
        equipmentAssetService.updateStatus(id, status);
        return Result.success();
    }

    @PutMapping("/{id}/refresh-maintenance")
    @RequireRole(RoleConstant.ADMIN_AND_DISPATCHER)
    public Result<Void> refreshMaintenanceDate(@PathVariable Long id) {
        equipmentAssetService.refreshMaintenanceDate(id);
        return Result.success();
    }
}