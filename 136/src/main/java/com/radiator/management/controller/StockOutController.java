package com.radiator.management.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.radiator.management.annotation.OpLog;
import com.radiator.management.annotation.RequiresRole;
import com.radiator.management.common.Result;
import com.radiator.management.entity.StockOutOrder;
import com.radiator.management.entity.StockOutDetail;
import com.radiator.management.service.StockOutService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stock-out")
@RequiredArgsConstructor
@RequiresRole({"production_leader", "warehouse_manager"})
public class StockOutController {

    private final StockOutService stockOutService;

    @PostMapping
    @OpLog(module = "出库管理", operation = "创建出库单")
    public Result<Void> createStockOutOrder(@RequestBody StockOutOrder order, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        stockOutService.createStockOutOrder(order, userId);
        return Result.success();
    }

    @PutMapping
    @OpLog(module = "出库管理", operation = "更新出库单")
    public Result<Void> updateStockOutOrder(@RequestBody StockOutOrder order) {
        stockOutService.updateStockOutOrder(order);
        return Result.success();
    }

    @PutMapping("/{id}/submit")
    @OpLog(module = "出库管理", operation = "提交出库单")
    public Result<Void> submitStockOutOrder(@PathVariable Long id) {
        stockOutService.submitStockOutOrder(id);
        return Result.success();
    }

    @PutMapping("/{id}/approve")
    @OpLog(module = "出库管理", operation = "审核出库单")
    public Result<Void> approveStockOutOrder(@PathVariable Long id, HttpServletRequest request) {
        Long approverId = (Long) request.getAttribute("userId");
        stockOutService.approveStockOutOrder(id, approverId);
        return Result.success();
    }

    @PutMapping("/{id}/reject")
    @OpLog(module = "出库管理", operation = "拒绝出库单")
    public Result<Void> rejectStockOutOrder(@PathVariable Long id, @RequestParam String remark) {
        stockOutService.rejectStockOutOrder(id, remark);
        return Result.success();
    }

    @GetMapping("/page")
    public Result<Page<StockOutOrder>> listStockOutOrders(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword) {
        return Result.success(stockOutService.listStockOutOrders(page, size, status, keyword));
    }

    @GetMapping("/{id}")
    public Result<StockOutOrder> getStockOutOrderById(@PathVariable Long id) {
        return Result.success(stockOutService.getStockOutOrderById(id));
    }

    @GetMapping("/{id}/details")
    public Result<List<StockOutDetail>> getStockOutDetails(@PathVariable Long id) {
        return Result.success(stockOutService.getStockOutDetails(id));
    }
}
