package com.construction.material.controller;

import com.construction.material.annotation.OperationLog;
import com.construction.material.annotation.RequiresRole;
import com.construction.material.common.PageQuery;
import com.construction.material.common.PageResult;
import com.construction.material.common.Result;
import com.construction.material.dto.*;
import com.construction.material.entity.InventoryFlow;
import com.construction.material.entity.MaterialInventory;
import com.construction.material.service.InventoryFlowService;
import com.construction.material.service.MaterialInventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/inventory")
@RequiredArgsConstructor
public class MaterialInventoryController {

    private final MaterialInventoryService inventoryService;
    private final InventoryFlowService flowService;

    @PostMapping
    @RequiresRole({"ADMIN", "PURCHASER", "WAREHOUSE_KEEPER"})
    @OperationLog(module = "库存管理模块", operation = "新增库存", description = "新增建材库存记录")
    public Result<Void> addInventory(@Valid @RequestBody MaterialInventoryDTO dto) {
        inventoryService.addInventory(dto);
        return Result.success();
    }

    @PutMapping
    @RequiresRole({"ADMIN", "PURCHASER", "WAREHOUSE_KEEPER"})
    @OperationLog(module = "库存管理模块", operation = "更新库存", description = "更新建材库存信息")
    public Result<Void> updateInventory(@Valid @RequestBody MaterialInventoryDTO dto) {
        inventoryService.updateInventory(dto);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @RequiresRole({"ADMIN"})
    @OperationLog(module = "库存管理模块", operation = "删除库存", description = "删除建材库存记录")
    public Result<Void> deleteInventory(@PathVariable Long id) {
        inventoryService.deleteInventory(id);
        return Result.success();
    }

    @GetMapping("/{id}")
    public Result<MaterialInventory> getInventory(@PathVariable Long id) {
        return Result.success(inventoryService.getInventory(id));
    }

    @GetMapping("/page")
    public Result<PageResult<MaterialInventory>> getInventoryPage(
            PageQuery pageQuery,
            MaterialInventoryQueryDTO queryDTO) {
        return Result.success(inventoryService.getInventoryPage(pageQuery, queryDTO));
    }

    @PostMapping("/inbound")
    @RequiresRole({"ADMIN", "PURCHASER", "WAREHOUSE_KEEPER"})
    @OperationLog(module = "库存管理模块", operation = "采购入库", description = "建材采购入库")
    public Result<Void> inboundInventory(@Valid @RequestBody InventoryInboundDTO dto) {
        inventoryService.inboundInventory(dto);
        return Result.success();
    }

    @PostMapping("/transfer")
    @RequiresRole({"ADMIN", "WAREHOUSE_KEEPER"})
    @OperationLog(module = "库存管理模块", operation = "库存调拨", description = "仓库间库存调拨")
    public Result<Void> transferInventory(@Valid @RequestBody InventoryTransferDTO dto) {
        inventoryService.transferInventory(dto);
        return Result.success();
    }

    @PostMapping("/check")
    @RequiresRole({"ADMIN", "WAREHOUSE_KEEPER"})
    @OperationLog(module = "库存管理模块", operation = "库存盘点", description = "库存盘点")
    public Result<Map<String, Object>> checkInventory(@Valid @RequestBody InventoryCheckDTO dto) {
        return Result.success(inventoryService.checkInventory(dto));
    }

    @PostMapping("/stock-in/{id}")
    @RequiresRole({"ADMIN", "WAREHOUSE_KEEPER"})
    @OperationLog(module = "库存管理模块", operation = "入库操作", description = "建材入库操作")
    public Result<Void> stockIn(@PathVariable Long id, @RequestParam BigDecimal quantity) {
        inventoryService.stockIn(id, quantity);
        return Result.success();
    }

    @PostMapping("/stock-out/{id}")
    @RequiresRole({"ADMIN", "WAREHOUSE_KEEPER"})
    @OperationLog(module = "库存管理模块", operation = "出库操作", description = "建材出库操作")
    public Result<Void> stockOut(@PathVariable Long id, @RequestParam BigDecimal quantity) {
        inventoryService.stockOut(id, quantity);
        return Result.success();
    }

    @GetMapping("/warning")
    public Result<List<MaterialInventory>> getWarningInventory() {
        return Result.success(inventoryService.getWarningInventory());
    }

    @GetMapping("/moisture-warning")
    @RequiresRole({"ADMIN", "WAREHOUSE_KEEPER", "SUPERVISOR"})
    public Result<List<MaterialInventory>> getMoistureProofWarning() {
        return Result.success(inventoryService.getMoistureProofWarning());
    }

    @PostMapping("/update-status")
    @RequiresRole({"ADMIN", "WAREHOUSE_KEEPER"})
    @OperationLog(module = "库存管理模块", operation = "更新库存状态", description = "批量更新库存状态")
    public Result<Void> updateInventoryStatus() {
        inventoryService.updateInventoryStatus();
        return Result.success();
    }

    @GetMapping("/summary")
    public Result<Map<String, Object>> getInventorySummary(
            @RequestParam(required = false) String warehouse) {
        return Result.success(inventoryService.getInventorySummary(warehouse));
    }

    @GetMapping("/by-category")
    public Result<List<Map<String, Object>>> getInventoryByCategory(
            @RequestParam(required = false) String warehouse) {
        return Result.success(inventoryService.getInventoryByCategory(warehouse));
    }

    @GetMapping("/flow/page")
    public Result<PageResult<InventoryFlow>> getFlowPage(
            PageQuery pageQuery,
            InventoryFlowQueryDTO queryDTO) {
        return Result.success(flowService.getFlowPage(pageQuery, queryDTO));
    }
}
