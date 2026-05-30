package com.woodendoor.production.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.woodendoor.production.annotation.RequireRole;
import com.woodendoor.production.common.Result;
import com.woodendoor.production.entity.Material;
import com.woodendoor.production.entity.MaterialLock;
import com.woodendoor.production.service.MaterialService;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/material")
@RequiredArgsConstructor
@RequireRole({"purchaser", "admin"})
public class MaterialController {

    private final MaterialService materialService;

    @PostMapping
    public Result<Void> add(@RequestBody Material material) {
        materialService.addMaterial(material);
        return Result.success();
    }

    @GetMapping("/all")
    @RequireRole({"purchaser", "leader", "designer", "quality", "admin"})
    public Result<List<Material>> getAll() {
        return Result.success(materialService.getAllMaterials());
    }

    @GetMapping("/page")
    @RequireRole({"purchaser", "leader", "designer", "quality", "admin"})
    public Result<Page<Material>> page(@RequestParam(defaultValue = "1") Integer pageNum,
                                       @RequestParam(defaultValue = "10") Integer pageSize,
                                       @RequestParam(required = false) Integer status,
                                       @RequestParam(required = false) String type,
                                       @RequestParam(required = false) String materialType) {
        return Result.success(materialService.page(pageNum, pageSize, status, type, materialType));
    }

    @PutMapping("/{id}/stock-in")
    public Result<Void> stockIn(@PathVariable Long id, @RequestParam @NotNull BigDecimal quantity) {
        materialService.stockIn(id, quantity);
        return Result.success();
    }

    @PutMapping("/{id}/stock-out")
    @RequireRole({"purchaser", "leader", "admin"})
    public Result<Void> stockOut(@PathVariable Long id, @RequestParam @NotNull BigDecimal quantity) {
        materialService.stockOut(id, quantity);
        return Result.success();
    }

    @PutMapping("/{id}/status")
    public Result<Void> updateStatus(@PathVariable Long id, @RequestParam Integer status) {
        materialService.updateStatus(id, status);
        return Result.success();
    }

    @PutMapping("/{id}/ventilate-remind")
    public Result<Void> setVentilateRemind(@PathVariable Long id,
                                             @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime remindTime) {
        materialService.setVentilateRemind(id, remindTime);
        return Result.success();
    }

    @PutMapping("/{id}/mark-ventilated")
    public Result<Void> markVentilated(@PathVariable Long id) {
        materialService.markVentilated(id);
        return Result.success();
    }

    @GetMapping("/ventilate-remind")
    @RequireRole({"purchaser", "leader", "quality", "admin"})
    public Result<List<Material>> getVentilateRemindList() {
        return Result.success(materialService.getVentilateRemindList());
    }

    @GetMapping("/warning")
    @RequireRole({"purchaser", "leader", "admin"})
    public Result<List<Material>> getWarningList() {
        return Result.success(materialService.getWarningList());
    }

    @GetMapping("/{id}/available-quantity")
    @RequireRole({"purchaser", "leader", "designer", "admin"})
    public Result<BigDecimal> getAvailableQuantity(@PathVariable Long id) {
        return Result.success(materialService.getAvailableQuantity(id));
    }

    @GetMapping("/locks/order/{orderId}")
    @RequireRole({"purchaser", "leader", "designer", "admin"})
    public Result<List<MaterialLock>> getMaterialLocksByOrder(@PathVariable Long orderId) {
        return Result.success(materialService.getMaterialLocksByOrder(orderId));
    }

    @PutMapping("/locks/lock")
    @RequireRole({"leader", "designer", "admin"})
    public Result<Void> lockMaterial(@RequestParam Long orderId,
                                      @RequestParam String orderNo,
                                      @RequestParam Long materialId,
                                      @RequestParam BigDecimal quantity,
                                      @RequestParam(required = false) String remark) {
        materialService.lockMaterial(orderId, orderNo, materialId, quantity, remark);
        return Result.success();
    }

    @PutMapping("/locks/unlock")
    @RequireRole({"leader", "designer", "admin"})
    public Result<Void> unlockMaterial(@RequestParam Long orderId,
                                        @RequestParam(required = false) Long materialId) {
        materialService.unlockMaterial(orderId, materialId);
        return Result.success();
    }
}