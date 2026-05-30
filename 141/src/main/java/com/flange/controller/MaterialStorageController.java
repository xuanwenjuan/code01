package com.flange.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.flange.common.Result;
import com.flange.dto.InventoryCheckDto;
import com.flange.dto.MaterialDto;
import com.flange.dto.MaterialQueryDto;
import com.flange.entity.InventoryCheck;
import com.flange.entity.InventoryLog;
import com.flange.entity.MaterialLock;
import com.flange.entity.MaterialStorage;
import com.flange.service.MaterialStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@Tag(name = "原料仓储管理")
@RestController
@RequestMapping("/api/material")
@RequiredArgsConstructor
public class MaterialStorageController {

    private final MaterialStorageService materialService;

    @Operation(summary = "多条件查询物料列表")
    @PostMapping("/query")
    public Result<IPage<MaterialStorage>> queryMaterials(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestBody MaterialQueryDto queryDto) {
        return Result.success(materialService.queryMaterials(page, size, queryDto));
    }

    @Operation(summary = "获取物料详情")
    @GetMapping("/{id}")
    public Result<MaterialStorage> getMaterialById(@PathVariable Long id) {
        return Result.success(materialService.getMaterialById(id));
    }

    @Operation(summary = "新增物料")
    @PostMapping
    public Result<Void> addMaterial(@Valid @RequestBody MaterialDto dto) {
        materialService.addMaterial(dto);
        return Result.success();
    }

    @Operation(summary = "更新物料")
    @PutMapping
    public Result<Void> updateMaterial(@Valid @RequestBody MaterialDto dto) {
        materialService.updateMaterial(dto);
        return Result.success();
    }

    @Operation(summary = "删除物料")
    @DeleteMapping("/{id}")
    public Result<Void> deleteMaterial(@PathVariable Long id) {
        materialService.deleteMaterial(id);
        return Result.success();
    }

    @Operation(summary = "库存预警列表")
    @GetMapping("/warning")
    public Result<List<MaterialStorage>> getWarningList() {
        return Result.success(materialService.getRustRemindList());
    }

    @Operation(summary = "防锈提醒列表")
    @GetMapping("/rust-remind")
    public Result<List<MaterialStorage>> getRustRemindList() {
        return Result.success(materialService.getRustRemindList());
    }

    @Operation(summary = "更新库存")
    @PutMapping("/{id}/stock")
    public Result<Void> updateStock(
            @PathVariable Long id,
            @RequestParam BigDecimal quantity,
            @RequestParam String operationType,
            @RequestParam(required = false) String remark,
            @RequestParam(required = false) Long relatedOrderId) {
        materialService.updateStock(id, quantity, operationType, remark, relatedOrderId);
        return Result.success();
    }

    @Operation(summary = "获取可用库存数量")
    @GetMapping("/{id}/available")
    public Result<BigDecimal> getAvailableQuantity(@PathVariable Long id) {
        return Result.success(materialService.getAvailableQuantity(id));
    }

    @Operation(summary = "锁定物料库存")
    @PostMapping("/lock")
    public Result<Void> lockMaterial(
            @RequestParam Long materialId,
            @RequestParam Long orderId,
            @RequestParam String orderNo,
            @RequestParam BigDecimal lockQuantity,
            @RequestParam(required = false) String remark) {
        materialService.lockMaterial(materialId, orderId, orderNo, lockQuantity, remark);
        return Result.success();
    }

    @Operation(summary = "释放物料锁定")
    @PutMapping("/lock/release/{lockId}")
    public Result<Void> releaseLock(@PathVariable Long lockId) {
        materialService.releaseLock(lockId);
        return Result.success();
    }

    @Operation(summary = "确认锁定物料使用（扣减库存）")
    @PutMapping("/lock/confirm/{lockId}")
    public Result<Void> confirmLockUsage(@PathVariable Long lockId) {
        materialService.confirmLockUsage(lockId);
        return Result.success();
    }

    @Operation(summary = "获取库存日志列表")
    @GetMapping("/inventory-log")
    public Result<IPage<InventoryLog>> getInventoryLogPage(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Long materialId,
            @RequestParam(required = false) String operationType) {
        return Result.success(materialService.getInventoryLogPage(page, size, materialId, operationType));
    }

    @Operation(summary = "创建库存盘点单")
    @PostMapping("/inventory-check")
    public Result<Void> createInventoryCheck(@Valid @RequestBody InventoryCheckDto dto) {
        materialService.createInventoryCheck(dto);
        return Result.success();
    }

    @Operation(summary = "审批库存盘点单")
    @PutMapping("/inventory-check/approve/{checkId}")
    public Result<Void> approveInventoryCheck(
            @PathVariable Long checkId,
            @RequestParam String diffReason,
            @RequestParam(defaultValue = "true") boolean adjustStock) {
        materialService.approveInventoryCheck(checkId, diffReason, adjustStock);
        return Result.success();
    }

    @Operation(summary = "获取库存盘点列表")
    @GetMapping("/inventory-check")
    public Result<IPage<InventoryCheck>> getInventoryCheckPage(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status) {
        return Result.success(materialService.getInventoryCheckPage(page, size, status));
    }

    @Operation(summary = "获取物料锁定记录")
    @GetMapping("/lock")
    public Result<IPage<MaterialLock>> getMaterialLockPage(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Long materialId,
            @RequestParam(required = false) Long orderId,
            @RequestParam(required = false) String status) {
        return Result.success(materialService.getMaterialLockPage(page, size, materialId, orderId, status));
    }
}
