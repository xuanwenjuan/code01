package com.gearbox.manage.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.gearbox.manage.annotation.RequiresRole;
import com.gearbox.manage.common.Result;
import com.gearbox.manage.dto.MaterialQueryDTO;
import com.gearbox.manage.dto.PickMaterialDTO;
import com.gearbox.manage.entity.Material;
import com.gearbox.manage.entity.MaterialBatch;
import com.gearbox.manage.service.MaterialService;
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

    @GetMapping("/page")
    public Result<Page<Material>> listPage(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String materialType,
            @RequestParam(required = false) String status) {
        return Result.success(materialService.listPage(pageNum, pageSize, materialType, status));
    }

    @PostMapping("/query")
    public Result<IPage<Material>> queryPage(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestBody MaterialQueryDTO dto) {
        return Result.success(materialService.queryPage(pageNum, pageSize, dto));
    }

    @GetMapping("/type/{type}")
    public Result<List<Material>> listByType(@PathVariable String type) {
        return Result.success(materialService.listByType(type));
    }

    @GetMapping("/status/{status}")
    public Result<List<Material>> listByStatus(@PathVariable String status) {
        return Result.success(materialService.listByStatus(status));
    }

    @PostMapping
    @RequiresRole({"ADMIN", "PURCHASER"})
    public Result<Void> add(@Valid @RequestBody Material material) {
        return materialService.add(material) ? Result.success() : Result.error("添加失败");
    }

    @PutMapping
    @RequiresRole({"ADMIN", "PURCHASER"})
    public Result<Void> update(@Valid @RequestBody Material material) {
        return materialService.updateMaterial(material) ? Result.success() : Result.error("更新失败");
    }

    @PostMapping("/stockIn")
    @RequiresRole({"ADMIN", "PURCHASER"})
    public Result<Void> stockIn(
            @RequestParam Long materialId,
            @RequestParam BigDecimal quantity,
            @RequestParam String warehouseLocation) {
        return materialService.stockIn(materialId, quantity, warehouseLocation) ? Result.success() : Result.error("入库失败");
    }

    @PostMapping("/batchStockIn")
    @RequiresRole({"ADMIN", "PURCHASER"})
    public Result<Void> batchStockIn(@RequestBody List<MaterialBatch> batches) {
        return materialService.batchStockIn(batches) ? Result.success() : Result.error("批量入库失败");
    }

    @PostMapping("/pick")
    @RequiresRole({"ADMIN", "TEAM_LEADER"})
    public Result<Void> pickMaterial(@Valid @RequestBody PickMaterialDTO dto) {
        return materialService.pickMaterial(dto) ? Result.success() : Result.error("领料失败");
    }

    @PostMapping("/lock/{workOrderId}")
    @RequiresRole({"ADMIN", "TEAM_LEADER"})
    public Result<Void> lockMaterial(@PathVariable Long workOrderId) {
        return materialService.lockMaterial(workOrderId) ? Result.success() : Result.error("锁定失败");
    }

    @GetMapping("/{materialId}/batches")
    public Result<List<MaterialBatch>> getBatchesByMaterialId(@PathVariable Long materialId) {
        return Result.success(materialService.getBatchesByMaterialId(materialId));
    }

    @GetMapping("/{materialId}/availableBatches")
    public Result<List<MaterialBatch>> getAvailableBatches(@PathVariable Long materialId) {
        return Result.success(materialService.getAvailableBatches(materialId));
    }

    @GetMapping("/{id}")
    public Result<Material> getById(@PathVariable Long id) {
        return Result.success(materialService.getById(id));
    }

    @DeleteMapping("/{id}")
    @RequiresRole({"ADMIN"})
    public Result<Void> delete(@PathVariable Long id) {
        return materialService.deleteMaterial(id) ? Result.success() : Result.error("删除失败");
    }
}
