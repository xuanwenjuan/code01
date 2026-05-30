package com.radiator.management.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.radiator.management.annotation.OpLog;
import com.radiator.management.annotation.RequiresRole;
import com.radiator.management.common.Result;
import com.radiator.management.entity.Warehouse;
import com.radiator.management.entity.WarehouseLocation;
import com.radiator.management.service.WarehouseService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/warehouse")
@RequiredArgsConstructor
@RequiresRole({"purchase_officer", "warehouse_manager"})
public class WarehouseController {

    private final WarehouseService warehouseService;

    @PostMapping
    @OpLog(module = "仓库管理", operation = "创建仓库")
    public Result<Void> createWarehouse(@RequestBody Warehouse warehouse) {
        warehouseService.createWarehouse(warehouse);
        return Result.success();
    }

    @PutMapping
    @OpLog(module = "仓库管理", operation = "更新仓库")
    public Result<Void> updateWarehouse(@RequestBody Warehouse warehouse) {
        warehouseService.updateWarehouse(warehouse);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @OpLog(module = "仓库管理", operation = "删除仓库")
    public Result<Void> deleteWarehouse(@PathVariable Long id) {
        warehouseService.deleteWarehouse(id);
        return Result.success();
    }

    @GetMapping("/page")
    public Result<Page<Warehouse>> listWarehouses(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword) {
        return Result.success(warehouseService.listWarehouses(page, size, keyword));
    }

    @GetMapping("/{id}")
    public Result<Warehouse> getWarehouseById(@PathVariable Long id) {
        return Result.success(warehouseService.getWarehouseById(id));
    }

    @GetMapping("/list")
    public Result<List<Warehouse>> getActiveWarehouses() {
        return Result.success(warehouseService.getActiveWarehouses());
    }

    @PostMapping("/location")
    @OpLog(module = "仓库管理", operation = "创建库位")
    public Result<Void> createLocation(@RequestBody WarehouseLocation location) {
        warehouseService.createLocation(location);
        return Result.success();
    }

    @PutMapping("/location")
    @OpLog(module = "仓库管理", operation = "更新库位")
    public Result<Void> updateLocation(@RequestBody WarehouseLocation location) {
        warehouseService.updateLocation(location);
        return Result.success();
    }

    @DeleteMapping("/location/{id}")
    @OpLog(module = "仓库管理", operation = "删除库位")
    public Result<Void> deleteLocation(@PathVariable Long id) {
        warehouseService.deleteLocation(id);
        return Result.success();
    }

    @GetMapping("/location/page")
    public Result<Page<WarehouseLocation>> listLocations(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Long warehouseId) {
        return Result.success(warehouseService.listLocations(page, size, warehouseId));
    }

    @GetMapping("/location/list/{warehouseId}")
    public Result<List<WarehouseLocation>> getLocationsByWarehouse(@PathVariable Long warehouseId) {
        return Result.success(warehouseService.getLocationsByWarehouse(warehouseId));
    }
}
