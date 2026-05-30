package com.stationery.manufacture.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.stationery.manufacture.common.RequireRole;
import com.stationery.manufacture.common.Result;
import com.stationery.manufacture.entity.StockLock;
import com.stationery.manufacture.service.StockLockService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/stock/lock")
@Tag(name = "库存锁定管理")
@RequireRole({"PRODUCTION_LEADER", "ADMIN"})
public class StockLockController {

    private final StockLockService stockLockService;

    public StockLockController(StockLockService stockLockService) {
        this.stockLockService = stockLockService;
    }

    @PostMapping("/order/{orderId}")
    @Operation(summary = "工单原料锁定库存")
    public Result<Void> lockStockForOrder(@PathVariable Long orderId) {
        stockLockService.lockStockForOrder(orderId);
        return Result.success();
    }

    @PutMapping("/order/{orderId}/unlock")
    @Operation(summary = "工单解锁库存")
    public Result<Void> unlockStockForOrder(
            @PathVariable Long orderId,
            @RequestParam String reason) {
        stockLockService.unlockStockForOrder(orderId, reason);
        return Result.success();
    }

    @PutMapping("/{lockId}/unlock")
    @Operation(summary = "解锁单个锁定")
    public Result<Void> unlockStock(
            @PathVariable Long lockId,
            @RequestParam String reason) {
        stockLockService.unlockStock(lockId, reason);
        return Result.success();
    }

    @PutMapping("/order/{orderId}/deduct")
    @Operation(summary = "确认并扣减库存")
    public Result<Void> confirmAndDeductStock(@PathVariable Long orderId) {
        stockLockService.confirmAndDeductStock(orderId);
        return Result.success();
    }

    @GetMapping("/available/{materialId}")
    @Operation(summary = "查询物料可用数量")
    public Result<BigDecimal> getAvailableQuantity(@PathVariable Long materialId) {
        return Result.success(stockLockService.getAvailableQuantity(materialId));
    }

    @GetMapping("/page")
    @Operation(summary = "锁定记录分页")
    public Result<Page<StockLock>> getLockPage(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Long orderId,
            @RequestParam(required = false) Long materialId,
            @RequestParam(required = false) Integer lockStatus) {
        return Result.success(stockLockService.getLockPage(pageNum, pageSize, orderId, materialId, lockStatus));
    }

    @GetMapping("/order/{orderId}")
    @Operation(summary = "工单锁定列表")
    public Result<List<StockLock>> getLocksByOrder(@PathVariable Long orderId) {
        return Result.success(stockLockService.getLocksByOrder(orderId));
    }
}
