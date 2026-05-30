package com.mining.maintenance.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.mining.maintenance.annotation.Log;
import com.mining.maintenance.annotation.RequireRole;
import com.mining.maintenance.common.Result;
import com.mining.maintenance.constant.RoleConstant;
import com.mining.maintenance.dto.MaterialUsageDTO;
import com.mining.maintenance.entity.Material;
import com.mining.maintenance.entity.MaterialUsageRecord;
import com.mining.maintenance.service.MaterialService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/material")
@RequiredArgsConstructor
public class MaterialController {

    private final MaterialService materialService;

    @PostMapping("/use")
    @RequireRole({RoleConstant.ADMIN, RoleConstant.TECHNICIAN, RoleConstant.MATERIAL})
    @Log(operationModule = "物资管理", operationType = "修改", operationDesc = "领用物资")
    public Result<Void> useMaterial(@Valid @RequestBody MaterialUsageDTO dto) {
        materialService.useMaterial(dto);
        return Result.success();
    }

    @PutMapping("/usage/{id}/verify")
    @RequireRole(RoleConstant.ADMIN_AND_MATERIAL)
    @Log(operationModule = "物资管理", operationType = "修改", operationDesc = "核销物资领用")
    public Result<Void> verifyRecord(
            @PathVariable Long id,
            @RequestParam Long verifierId,
            @RequestParam String verifierName) {
        materialService.verifyRecord(id, verifierId, verifierName);
        return Result.success();
    }

    @GetMapping("/usage/page")
    @RequireRole(RoleConstant.ALL_ROLES)
    public Result<Page<MaterialUsageRecord>> queryUsageRecords(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String miningArea,
            @RequestParam(required = false) String status) {
        return Result.success(materialService.queryUsageRecords(page, size, miningArea, status));
    }

    @GetMapping("/page")
    @RequireRole(RoleConstant.ALL_ROLES)
    public Result<Page<Material>> queryMaterials(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String miningArea) {
        Page<Material> pageParam = new Page<>(page, size);
        return Result.success(materialService.page(pageParam));
    }

    @GetMapping("/{id}")
    @RequireRole(RoleConstant.ALL_ROLES)
    public Result<Material> getById(@PathVariable Long id) {
        return Result.success(materialService.getById(id));
    }
}