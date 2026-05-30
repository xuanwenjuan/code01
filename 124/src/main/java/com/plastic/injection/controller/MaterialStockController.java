package com.plastic.injection.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.plastic.injection.annotation.RequirePermission;
import com.plastic.injection.common.Result;
import com.plastic.injection.dto.DefectiveScrapDTO;
import com.plastic.injection.dto.MaterialInboundDTO;
import com.plastic.injection.dto.MaterialStockDTO;
import com.plastic.injection.enums.PermissionType;
import com.plastic.injection.service.MaterialStockService;
import com.plastic.injection.vo.MaterialStockVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/material-stock")
@RequiredArgsConstructor
public class MaterialStockController {

    private final MaterialStockService materialStockService;

    @PostMapping("/inbound")
    @RequirePermission(PermissionType.MATERIAL_MANAGE)
    public Result<Void> inbound(@Valid @RequestBody MaterialInboundDTO dto) {
        materialStockService.inbound(dto);
        return Result.success();
    }

    @PostMapping
    @RequirePermission(PermissionType.MATERIAL_MANAGE)
    public Result<Void> create(@Valid @RequestBody MaterialStockDTO dto) {
        materialStockService.saveMaterial(dto);
        return Result.success();
    }

    @PutMapping("/{id}")
    @RequirePermission(PermissionType.MATERIAL_MANAGE)
    public Result<Void> update(@PathVariable Long id, @Valid @RequestBody MaterialStockDTO dto) {
        dto.setId(id);
        materialStockService.saveMaterial(dto);
        return Result.success();
    }

    @GetMapping("/page")
    @RequirePermission(PermissionType.MATERIAL_VIEW)
    public Result<Page<MaterialStockVO>> page(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String materialName,
            @RequestParam(required = false) String materialCode,
            @RequestParam(required = false) Integer stockStatus,
            @RequestParam(required = false) Integer isHygroscopic) {
        return Result.success(materialStockService.pageQuery(pageNum, pageSize, materialName, materialCode, stockStatus, isHygroscopic));
    }

    @GetMapping("/{id}")
    public Result<MaterialStockVO> getById(@PathVariable Long id) {
        return Result.success(materialStockService.getById(id));
    }

    @PutMapping("/{id}/lock")
    @RequirePermission(PermissionType.MATERIAL_MANAGE)
    public Result<Void> lockStock(@PathVariable Long id, @RequestParam BigDecimal quantity) {
        materialStockService.lockStock(id, quantity);
        return Result.success();
    }

    @PutMapping("/{id}/unlock-consume")
    @RequirePermission(PermissionType.MATERIAL_MANAGE)
    public Result<Void> unlockAndConsume(@PathVariable Long id,
                                          @RequestParam BigDecimal lockQuantity,
                                          @RequestParam BigDecimal actualQuantity) {
        materialStockService.unlockAndConsumeStock(id, lockQuantity, actualQuantity);
        return Result.success();
    }

    @PostMapping("/defective-scrap")
    @RequirePermission(PermissionType.MATERIAL_MANAGE)
    public Result<Void> defectiveScrap(@Valid @RequestBody DefectiveScrapDTO dto) {
        materialStockService.defectiveScrap(dto);
        return Result.success();
    }

    @GetMapping("/warnings")
    public Result<java.util.List<String>> getWarnings() {
        return Result.success(materialStockService.getWarnings());
    }

    @DeleteMapping("/{id}")
    @RequirePermission(PermissionType.MATERIAL_MANAGE)
    public Result<Void> delete(@PathVariable Long id) {
        materialStockService.deleteById(id);
        return Result.success();
    }
}
