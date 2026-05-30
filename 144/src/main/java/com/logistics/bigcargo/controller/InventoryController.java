package com.logistics.bigcargo.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.logistics.bigcargo.common.Result;
import com.logistics.bigcargo.dto.*;
import com.logistics.bigcargo.entity.Inventory;
import com.logistics.bigcargo.service.InventoryService;
import com.logistics.bigcargo.vo.InventoryStatisticsVO;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventories")
public class InventoryController {

    @Autowired
    private InventoryService inventoryService;

    @PostMapping
    @PreAuthorize("hasRole('WAREHOUSE_ADMIN')")
    public Result<Void> addInventory(@Valid @RequestBody InventoryDTO dto,
                                     @RequestHeader Long operatorId,
                                     @RequestHeader String operatorName) {
        inventoryService.addInventory(dto, operatorId, operatorName);
        return Result.success("入库登记成功", null);
    }

    @PostMapping("/check")
    @PreAuthorize("hasAnyRole('WAREHOUSE_ADMIN', 'SORTER')")
    public Result<Void> stockInCheck(@Valid @RequestBody StockInCheckDTO dto,
                                     @RequestHeader Long operatorId,
                                     @RequestHeader String operatorName) {
        inventoryService.stockInCheck(dto, operatorId, operatorName);
        return Result.success("入库清点完成", null);
    }

    @PostMapping("/store")
    @PreAuthorize("hasAnyRole('WAREHOUSE_ADMIN', 'SORTER')")
    public Result<Void> storeInZone(@Valid @RequestBody StoreInZoneDTO dto,
                                    @RequestHeader Long operatorId,
                                    @RequestHeader String operatorName) {
        inventoryService.storeInZone(dto, operatorId, operatorName);
        return Result.success("库区存放完成", null);
    }

    @PostMapping("/transfer")
    @PreAuthorize("hasRole('WAREHOUSE_ADMIN')")
    public Result<Void> stockTransfer(@Valid @RequestBody StockTransferDTO dto,
                                      @RequestHeader Long operatorId,
                                      @RequestHeader String operatorName) {
        inventoryService.stockTransfer(dto, operatorId, operatorName);
        return Result.success("库存调拨完成", null);
    }

    @PostMapping("/batch-status")
    @PreAuthorize("hasRole('WAREHOUSE_ADMIN')")
    public Result<Void> batchUpdateStockStatus(@Valid @RequestBody BatchStockStatusDTO dto,
                                               @RequestHeader Long operatorId,
                                               @RequestHeader String operatorName) {
        inventoryService.batchUpdateStockStatus(dto, operatorId, operatorName);
        return Result.success("批量更新成功", null);
    }

    @PutMapping
    @PreAuthorize("hasRole('WAREHOUSE_ADMIN')")
    public Result<Void> updateInventory(@Valid @RequestBody InventoryDTO dto,
                                        @RequestHeader Long operatorId,
                                        @RequestHeader String operatorName) {
        inventoryService.updateInventory(dto, operatorId, operatorName);
        return Result.success("更新成功", null);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('WAREHOUSE_ADMIN')")
    public Result<Void> deleteInventory(@PathVariable Long id,
                                        @RequestHeader Long operatorId,
                                        @RequestHeader String operatorName) {
        inventoryService.deleteInventory(id, operatorId, operatorName);
        return Result.success("删除成功", null);
    }

    @PutMapping("/{id}/status/{stockStatus}")
    @PreAuthorize("hasAnyRole('WAREHOUSE_ADMIN', 'SORTER')")
    public Result<Void> updateStockStatus(@PathVariable Long id,
                                          @PathVariable Integer stockStatus,
                                          @RequestHeader Long operatorId,
                                          @RequestHeader String operatorName) {
        inventoryService.updateStockStatus(id, stockStatus, operatorId, operatorName);
        return Result.success("状态更新成功", null);
    }

    @GetMapping("/{id}")
    public Result<Inventory> getInventoryById(@PathVariable Long id) {
        return Result.success(inventoryService.getInventoryById(id));
    }

    @GetMapping("/page")
    public Result<Page<Inventory>> getInventoryPage(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Integer stockStatus,
            @RequestParam(required = false) String goodsName,
            @RequestParam(required = false) String storageZone,
            @RequestParam(required = false) Integer bearingLevel,
            @RequestParam(required = false) Integer fragileFlag) {
        return Result.success(inventoryService.getInventoryPage(pageNum, pageSize, categoryId, stockStatus,
                goodsName, storageZone, bearingLevel, fragileFlag));
    }

    @GetMapping("/expiring")
    @PreAuthorize("hasRole('WAREHOUSE_ADMIN')")
    public Result<List<Inventory>> getExpiringInventories() {
        return Result.success(inventoryService.getExpiringInventories());
    }

    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('WAREHOUSE_ADMIN', 'DISPATCHER')")
    public Result<InventoryStatisticsVO> getStatistics() {
        return Result.success(inventoryService.getStatistics());
    }

    @PostMapping("/batch")
    @PreAuthorize("hasAnyRole('WAREHOUSE_ADMIN', 'DISPATCHER')")
    public Result<List<Inventory>> getInventoriesByIds(@RequestBody List<Long> ids) {
        return Result.success(inventoryService.getInventoriesByIds(ids));
    }

    @PostMapping("/query")
    public Result<Page<Inventory>> queryInventoryPage(@RequestBody InventoryQueryDTO dto) {
        return Result.success(inventoryService.queryInventoryPage(dto));
    }
}
