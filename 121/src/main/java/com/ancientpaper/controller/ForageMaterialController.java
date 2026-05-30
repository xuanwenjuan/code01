package com.ancientpaper.controller;

import com.ancientpaper.annotation.Log;
import com.ancientpaper.annotation.RequiresRole;
import com.ancientpaper.common.Result;
import com.ancientpaper.dto.ForageMaterialDTO;
import com.ancientpaper.entity.ForageMaterial;
import com.ancientpaper.service.ForageMaterialService;
import com.ancientpaper.validation.CreateGroup;
import com.ancientpaper.validation.UpdateGroup;
import com.baomidou.mybatisplus.core.metadata.IPage;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/material")
@RequiredArgsConstructor
@Validated
public class ForageMaterialController {

    private final ForageMaterialService materialService;

    @GetMapping("/page")
    public Result<IPage<ForageMaterial>> getMaterialPage(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String materialName,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) String originPlace,
            @RequestParam(required = false) BigDecimal minQuantity,
            @RequestParam(required = false) BigDecimal maxQuantity) {
        return Result.success(materialService.getMaterialPage(
            pageNum, pageSize, materialName, status, originPlace, minQuantity, maxQuantity));
    }

    @GetMapping("/available")
    public Result<java.util.List<ForageMaterial>> getAvailableMaterials(
            @RequestParam(required = false) String materialName) {
        return Result.success(materialService.getAvailableMaterials(materialName));
    }

    @GetMapping("/{id}")
    public Result<ForageMaterial> getMaterialById(@PathVariable @Positive(message = "原料ID必须大于0") Long id) {
        return Result.success(materialService.getMaterialById(id));
    }

    @PostMapping
    @RequiresRole({1, 4})
    @Log(module = "草料原料", type = "新增", desc = "新增草料原料")
    public Result<Void> addMaterial(@Validated(CreateGroup.class) @RequestBody ForageMaterialDTO dto) {
        materialService.addMaterial(dto);
        return Result.success();
    }

    @PutMapping
    @RequiresRole({1, 4})
    @Log(module = "草料原料", type = "修改", desc = "修改草料原料")
    public Result<Void> updateMaterial(@Validated(UpdateGroup.class) @RequestBody ForageMaterialDTO dto) {
        materialService.updateMaterial(dto);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @RequiresRole({4})
    @Log(module = "草料原料", type = "删除", desc = "删除草料原料")
    public Result<Void> deleteMaterial(@PathVariable @Positive(message = "原料ID必须大于0") Long id) {
        materialService.deleteMaterial(id);
        return Result.success();
    }

    @PutMapping("/{id}/moisture-warning")
    @RequiresRole({1, 3, 4})
    @Log(module = "草料原料", type = "预警", desc = "设置防潮霉变预警")
    public Result<Void> updateMoistureWarning(
            @PathVariable @Positive(message = "原料ID必须大于0") Long id,
            @RequestParam Integer warningStatus) {
        materialService.updateMoistureWarning(id, warningStatus);
        return Result.success();
    }
}
