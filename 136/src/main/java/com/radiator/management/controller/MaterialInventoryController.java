package com.radiator.management.controller;

import com.radiator.management.annotation.OpLog;
import com.radiator.management.common.Result;
import com.radiator.management.entity.MaterialInventory;
import com.radiator.management.service.MaterialInventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/material")
@RequiredArgsConstructor
public class MaterialInventoryController {

    private final MaterialInventoryService materialService;

    @PostMapping
    @OpLog(module = "铝材库存", operation = "新增物料")
    public Result<Void> addMaterial(@RequestBody MaterialInventory material) {
        materialService.addMaterial(material);
        return Result.success();
    }

    @PutMapping
    @OpLog(module = "铝材库存", operation = "更新物料")
    public Result<Void> updateMaterial(@RequestBody MaterialInventory material) {
        materialService.updateMaterial(material);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @OpLog(module = "铝材库存", operation = "删除物料")
    public Result<Void> deleteMaterial(@PathVariable Long id) {
        materialService.deleteMaterial(id);
        return Result.success();
    }

    @GetMapping
    public Result<List<MaterialInventory>> list(@RequestParam(required = false) String status) {
        return Result.success(materialService.list(status));
    }

    @GetMapping("/{id}")
    public Result<MaterialInventory> getById(@PathVariable Long id) {
        return Result.success(materialService.getById(id));
    }

    @PutMapping("/{id}/stock")
    @OpLog(module = "铝材库存", operation = "更新库存")
    public Result<Void> updateStock(@PathVariable Long id, @RequestParam BigDecimal quantity) {
        materialService.updateStock(id, quantity);
        return Result.success();
    }

    @GetMapping("/moisture-proof")
    public Result<List<MaterialInventory>> getMoistureProofMaterials() {
        return Result.success(materialService.getMoistureProofMaterials());
    }
}