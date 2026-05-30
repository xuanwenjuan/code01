package com.aromatherapy.controller;

import com.aromatherapy.annotation.RequiresPermission;
import com.aromatherapy.common.Result;
import com.aromatherapy.entity.RawMaterial;
import com.aromatherapy.service.RawMaterialService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/material")
@RequiredArgsConstructor
public class RawMaterialController {

    private final RawMaterialService materialService;

    @GetMapping
    @RequiresPermission("material:read")
    public Result<List<RawMaterial>> list(
            @RequestParam(required = false) String materialName,
            @RequestParam(required = false) Integer status) {
        return Result.success(materialService.list(materialName, status));
    }

    @GetMapping("/warning")
    @RequiresPermission("material:read")
    public Result<List<RawMaterial>> getWarningStockList() {
        return Result.success(materialService.getWarningStockList());
    }

    @GetMapping("/expiring-soon")
    @RequiresPermission("material:read")
    public Result<List<RawMaterial>> getExpiringSoonList(@RequestParam(defaultValue = "30") int days) {
        return Result.success(materialService.getExpiringSoonList(days));
    }

    @GetMapping("/{id}")
    @RequiresPermission("material:read")
    public Result<RawMaterial> getById(@PathVariable Long id) {
        return Result.success(materialService.getById(id));
    }

    @PostMapping
    @RequiresPermission("material:write")
    public Result<Void> create(@RequestBody RawMaterial material) {
        materialService.create(material);
        return Result.success();
    }

    @PutMapping
    @RequiresPermission("material:write")
    public Result<Void> update(@RequestBody RawMaterial material) {
        materialService.update(material);
        return Result.success();
    }

    @PutMapping("/{id}/stock")
    @RequiresPermission("material:write")
    public Result<Void> updateStock(@PathVariable Long id, @RequestParam BigDecimal quantity) {
        materialService.updateStock(id, quantity);
        return Result.success();
    }
}
