package com.spindle.manage.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.spindle.manage.annotation.OperationLogger;
import com.spindle.manage.annotation.RequiresPermission;
import com.spindle.manage.common.Result;
import com.spindle.manage.dto.MaterialOutDTO;
import com.spindle.manage.entity.MaterialInventory;
import com.spindle.manage.service.MaterialInventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/material")
@RequiredArgsConstructor
public class MaterialInventoryController {

    private final MaterialInventoryService materialInventoryService;

    @GetMapping("/page")
    public Result<IPage<MaterialInventory>> getMaterialPage(
            @RequestParam(defaultValue = "1") Integer current,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String materialName,
            @RequestParam(required = false) String materialType,
            @RequestParam(required = false) Integer inventoryStatus) {
        Page<MaterialInventory> page = new Page<>(current, size);
        return Result.success(materialInventoryService.getMaterialPage(page, materialName, materialType, inventoryStatus));
    }

    @GetMapping("/{id}")
    public Result<MaterialInventory> getMaterialById(@PathVariable Long id) {
        return Result.success(materialInventoryService.getById(id));
    }

    @PostMapping
    @RequiresPermission({"material:add"})
    @OperationLogger(value = "新增物料", operationType = "CREATE", businessType = "MATERIAL")
    public Result<Void> addMaterial(@Valid @RequestBody MaterialInventory material) {
        materialInventoryService.addMaterial(material);
        return Result.success();
    }

    @PutMapping
    @RequiresPermission({"material:update"})
    @OperationLogger(value = "更新物料", operationType = "UPDATE", businessType = "MATERIAL")
    public Result<Void> updateMaterial(@Valid @RequestBody MaterialInventory material) {
        materialInventoryService.updateMaterial(material);
        return Result.success();
    }

    @PutMapping("/{id}/status")
    @RequiresPermission({"material:update"})
    @OperationLogger(value = "更新库存状态", operationType = "UPDATE", businessType = "MATERIAL")
    public Result<Void> updateInventoryStatus(@PathVariable Long id, @RequestParam Integer status) {
        materialInventoryService.updateInventoryStatus(id, status);
        return Result.success();
    }

    @PostMapping("/out")
    @RequiresPermission({"material:out"})
    @OperationLogger(value = "物料出库", operationType = "OUT", businessType = "MATERIAL")
    public Result<Void> materialOut(@Valid @RequestBody MaterialOutDTO dto) {
        materialInventoryService.materialOut(dto);
        return Result.success();
    }

    @PostMapping("/{id}/in")
    @RequiresPermission({"material:in"})
    @OperationLogger(value = "物料入库", operationType = "IN", businessType = "MATERIAL")
    public Result<Void> materialIn(@PathVariable Long id, @RequestParam BigDecimal quantity, @RequestParam(required = false) String remark) {
        materialInventoryService.materialIn(id, quantity, remark);
        return Result.success();
    }

    @PostMapping("/prepare/{orderId}")
    @RequiresPermission({"material:prepare"})
    @OperationLogger(value = "工单备料", operationType = "UPDATE", businessType = "MATERIAL")
    public Result<Void> prepareMaterialForOrder(@PathVariable Long orderId) {
        materialInventoryService.prepareMaterialForOrder(orderId);
        return Result.success();
    }

}
