package com.battery.shell.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.battery.shell.annotation.RequireRole;
import com.battery.shell.common.Result;
import com.battery.shell.constant.RoleConstant;
import com.battery.shell.dto.MaterialDTO;
import com.battery.shell.dto.MaterialQueryDTO;
import com.battery.shell.entity.Material;
import com.battery.shell.service.MaterialService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/material")
@RequiredArgsConstructor
public class MaterialController {

    private final MaterialService materialService;

    @PostMapping
    @RequireRole({RoleConstant.PURCHASE, RoleConstant.ADMIN})
    public Result<Void> addMaterial(@Valid @RequestBody MaterialDTO dto) {
        materialService.addMaterial(dto);
        return Result.success("物料入库成功", null);
    }

    @PutMapping
    @RequireRole({RoleConstant.PURCHASE, RoleConstant.ADMIN})
    public Result<Void> updateMaterial(@Valid @RequestBody MaterialDTO dto) {
        materialService.updateMaterial(dto);
        return Result.success("物料更新成功", null);
    }

    @DeleteMapping("/{id}")
    @RequireRole({RoleConstant.ADMIN})
    public Result<Void> deleteMaterial(@PathVariable Long id) {
        materialService.deleteMaterial(id);
        return Result.success("物料删除成功", null);
    }

    @GetMapping("/{id}")
    public Result<Material> getMaterialById(@PathVariable Long id) {
        Material material = materialService.getMaterialById(id);
        if (material == null) {
            return Result.error("物料不存在");
        }
        return Result.success(material);
    }

    @PostMapping("/page")
    public Result<IPage<Material>> queryMaterialPage(@Valid @RequestBody MaterialQueryDTO queryDTO) {
        return Result.success(materialService.queryMaterialPage(queryDTO));
    }

    @GetMapping("/list")
    public Result<List<Material>> getMaterialList(
            @RequestParam(required = false) String materialType,
            @RequestParam(required = false) String status) {
        return Result.success(materialService.getMaterialList(materialType, status));
    }

    @PutMapping("/{id}/stock")
    @RequireRole({RoleConstant.PURCHASE, RoleConstant.ADMIN})
    public Result<Void> updateStock(@PathVariable Long id, @RequestParam BigDecimal quantity) {
        materialService.updateStock(id, quantity);
        return Result.success("库存更新成功", null);
    }

    @GetMapping("/expiring")
    @RequireRole({RoleConstant.PURCHASE, RoleConstant.QUALITY, RoleConstant.ADMIN})
    public Result<List<Material>> getExpiringMaterials() {
        return Result.success(materialService.getExpiringMaterials());
    }
}
