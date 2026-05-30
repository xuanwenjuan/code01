package com.hardware.stamping.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.hardware.stamping.annotation.RequiresRole;
import com.hardware.stamping.common.Result;
import com.hardware.stamping.dto.MaterialInventoryQueryDTO;
import com.hardware.stamping.entity.MaterialInventory;
import com.hardware.stamping.service.MaterialInventoryService;
import com.hardware.stamping.vo.MaterialInventoryVO;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/material-inventory")
public class MaterialInventoryController {

    @Autowired
    private MaterialInventoryService materialInventoryService;

    @PostMapping
    @RequiresRole({"ADMIN", "PURCHASER"})
    public Result<Void> addMaterial(@Valid @RequestBody MaterialInventory material) {
        materialInventoryService.addMaterial(material);
        return Result.success();
    }

    @PutMapping
    @RequiresRole({"ADMIN", "PURCHASER"})
    public Result<Void> updateMaterial(@Valid @RequestBody MaterialInventory material) {
        materialInventoryService.updateMaterial(material);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @RequiresRole({"ADMIN"})
    public Result<Void> deleteMaterial(@PathVariable Long id) {
        materialInventoryService.deleteMaterial(id);
        return Result.success();
    }

    @GetMapping("/{id}")
    public Result<MaterialInventory> getById(@PathVariable Long id) {
        return Result.success(materialInventoryService.getById(id));
    }

    @GetMapping("/list")
    public Result<List<MaterialInventory>> listAll() {
        return Result.success(materialInventoryService.listAll());
    }

    @PostMapping("/page")
    public Result<IPage<MaterialInventoryVO>> queryPage(@RequestBody MaterialInventoryQueryDTO queryDTO) {
        return Result.success(materialInventoryService.queryPage(queryDTO));
    }

    @GetMapping("/type/{materialType}")
    public Result<List<MaterialInventory>> listByMaterialType(@PathVariable String materialType) {
        return Result.success(materialInventoryService.listByMaterialType(materialType));
    }

    @GetMapping("/warning")
    @RequiresRole({"ADMIN", "PURCHASER", "FOREMAN"})
    public Result<List<MaterialInventory>> listWarningMaterials() {
        return Result.success(materialInventoryService.listWarningMaterials());
    }
}
