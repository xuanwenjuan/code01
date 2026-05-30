package com.horncomb.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.horncomb.annotation.RequireRole;
import com.horncomb.common.Constants;
import com.horncomb.common.Result;
import com.horncomb.dto.HornMaterialDTO;
import com.horncomb.dto.HornMaterialQueryDTO;
import com.horncomb.entity.HornMaterial;
import com.horncomb.service.HornMaterialService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/material")
@RequiredArgsConstructor
public class HornMaterialController {

    private final HornMaterialService hornMaterialService;

    @GetMapping("/page")
    @RequireRole({Constants.ROLE_ADMIN, Constants.ROLE_MATERIAL_SELECTOR, Constants.ROLE_WAREHOUSE_MANAGER})
    public Result<IPage<HornMaterial>> page(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @Valid HornMaterialQueryDTO queryDTO
    ) {
        IPage<HornMaterial> page = hornMaterialService.page(pageNum, pageSize, queryDTO);
        return Result.success(page);
    }

    @GetMapping("/{id}")
    @RequireRole({Constants.ROLE_ADMIN, Constants.ROLE_MATERIAL_SELECTOR, Constants.ROLE_WAREHOUSE_MANAGER})
    public Result<HornMaterial> getById(@PathVariable Long id) {
        HornMaterial material = hornMaterialService.getById(id);
        return Result.success(material);
    }

    @PostMapping
    @RequireRole({Constants.ROLE_ADMIN, Constants.ROLE_MATERIAL_SELECTOR})
    public Result<Void> create(@Valid @RequestBody HornMaterialDTO dto) {
        hornMaterialService.create(dto);
        return Result.success("创建成功", null);
    }

    @PutMapping
    @RequireRole({Constants.ROLE_ADMIN, Constants.ROLE_MATERIAL_SELECTOR})
    public Result<Void> update(@Valid @RequestBody HornMaterialDTO dto) {
        hornMaterialService.update(dto);
        return Result.success("更新成功", null);
    }

    @PutMapping("/{id}/stock")
    @RequireRole({Constants.ROLE_ADMIN, Constants.ROLE_WAREHOUSE_MANAGER})
    public Result<Void> updateStock(@PathVariable Long id, @RequestParam Integer quantity) {
        hornMaterialService.updateStock(id, quantity);
        return Result.success("库存更新成功", null);
    }

    @DeleteMapping("/{id}")
    @RequireRole({Constants.ROLE_ADMIN, Constants.ROLE_MATERIAL_SELECTOR})
    public Result<Void> delete(@PathVariable Long id) {
        hornMaterialService.delete(id);
        return Result.success("删除成功", null);
    }
}
