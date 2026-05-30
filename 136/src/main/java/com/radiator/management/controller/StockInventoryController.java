package com.radiator.management.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.radiator.management.annotation.OpLog;
import com.radiator.management.annotation.RequiresRole;
import com.radiator.management.common.Result;
import com.radiator.management.entity.StockInventory;
import com.radiator.management.entity.StockInventoryDetail;
import com.radiator.management.service.StockInventoryService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stock-inventory")
@RequiredArgsConstructor
@RequiresRole({"warehouse_manager", "purchase_officer"})
public class StockInventoryController {

    private final StockInventoryService inventoryService;

    @PostMapping
    @OpLog(module = "库存盘点", operation = "创建盘点单")
    public Result<Void> createInventory(@RequestBody StockInventory inventory, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        inventoryService.createInventory(inventory, userId);
        return Result.success();
    }

    @PutMapping("/{id}/details")
    @OpLog(module = "库存盘点", operation = "更新盘点明细")
    public Result<Void> updateInventoryDetail(@PathVariable Long id, @RequestBody List<StockInventoryDetail> details) {
        inventoryService.updateInventoryDetail(id, details);
        return Result.success();
    }

    @PutMapping("/{id}/submit")
    @OpLog(module = "库存盘点", operation = "提交盘点单")
    public Result<Void> submitInventory(@PathVariable Long id) {
        inventoryService.submitInventory(id);
        return Result.success();
    }

    @PutMapping("/{id}/approve")
    @OpLog(module = "库存盘点", operation = "审核盘点单")
    public Result<Void> approveInventory(@PathVariable Long id, HttpServletRequest request) {
        Long approverId = (Long) request.getAttribute("userId");
        inventoryService.approveInventory(id, approverId);
        return Result.success();
    }

    @PutMapping("/{id}/reject")
    @OpLog(module = "库存盘点", operation = "拒绝盘点单")
    public Result<Void> rejectInventory(@PathVariable Long id, @RequestParam String remark) {
        inventoryService.rejectInventory(id, remark);
        return Result.success();
    }

    @GetMapping("/page")
    public Result<Page<StockInventory>> listInventories(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long warehouseId) {
        return Result.success(inventoryService.listInventories(page, size, status, warehouseId));
    }

    @GetMapping("/{id}")
    public Result<StockInventory> getInventoryById(@PathVariable Long id) {
        return Result.success(inventoryService.getInventoryById(id));
    }

    @GetMapping("/{id}/details")
    public Result<List<StockInventoryDetail>> getInventoryDetails(@PathVariable Long id) {
        return Result.success(inventoryService.getInventoryDetails(id));
    }
}
