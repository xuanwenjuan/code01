package com.construction.embedded.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.construction.embedded.annotation.RequiresRole;
import com.construction.embedded.common.Result;
import com.construction.embedded.constant.RoleConstants;
import com.construction.embedded.dto.MaterialDTO;
import com.construction.embedded.dto.MaterialQueryDTO;
import com.construction.embedded.entity.Material;
import com.construction.embedded.service.MaterialService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/material")
public class MaterialController {

    @Autowired
    private MaterialService materialService;

    @PostMapping("/query")
    public Result<IPage<Material>> query(@Valid @RequestBody MaterialQueryDTO queryDTO) {
        IPage<Material> page = materialService.queryPage(queryDTO);
        return Result.success(page);
    }

    @GetMapping("/{id}")
    public Result<Material> getById(@PathVariable Long id) {
        Material material = materialService.getById(id);
        return Result.success(material);
    }

    @PostMapping
    @RequiresRole({RoleConstants.PURCHASER, RoleConstants.ADMIN})
    public Result<Void> addMaterial(@Valid @RequestBody MaterialDTO dto) {
        materialService.addMaterial(dto);
        return Result.success("添加成功", null);
    }

    @PutMapping
    @RequiresRole({RoleConstants.PURCHASER, RoleConstants.ADMIN})
    public Result<Void> updateMaterial(@Valid @RequestBody MaterialDTO dto) {
        materialService.updateMaterial(dto);
        return Result.success("更新成功", null);
    }

    @DeleteMapping("/{id}")
    @RequiresRole({RoleConstants.PURCHASER, RoleConstants.ADMIN})
    public Result<Void> deleteMaterial(@PathVariable Long id) {
        materialService.deleteMaterial(id);
        return Result.success("删除成功", null);
    }

    @PutMapping("/stock/{id}")
    @RequiresRole({RoleConstants.PURCHASER, RoleConstants.ADMIN})
    public Result<Void> updateStock(
            @PathVariable Long id,
            @RequestParam BigDecimal quantity) {
        materialService.updateStock(id, quantity);
        return Result.success("库存更新成功", null);
    }

    @PutMapping("/stock/adjust/{id}")
    @RequiresRole({RoleConstants.PURCHASER, RoleConstants.ADMIN})
    public Result<Void> adjustStock(
            @PathVariable Long id,
            @RequestParam BigDecimal amount) {
        materialService.adjustStock(id, amount);
        return Result.success("库存调整成功", null);
    }

    @GetMapping("/rust-warning")
    @RequiresRole({RoleConstants.PURCHASER, RoleConstants.TECHNICIAN, RoleConstants.ADMIN})
    public Result<IPage<Material>> getRustWarningList(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        IPage<Material> page = materialService.getRustWarningList(pageNum, pageSize);
        return Result.success(page);
    }

    @PutMapping("/rust-warning/clear/{id}")
    @RequiresRole({RoleConstants.PURCHASER, RoleConstants.TECHNICIAN, RoleConstants.ADMIN})
    public Result<Void> clearRustWarning(@PathVariable Long id) {
        materialService.clearRustWarning(id);
        return Result.success("锈蚀预警已清除", null);
    }

    @GetMapping("/low-stock")
    @RequiresRole({RoleConstants.PURCHASER, RoleConstants.TECHNICIAN, RoleConstants.ADMIN})
    public Result<IPage<Material>> getLowStockList(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        IPage<Material> page = materialService.getLowStockList(pageNum, pageSize);
        return Result.success(page);
    }
}
