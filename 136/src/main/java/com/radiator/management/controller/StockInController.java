package com.radiator.management.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.radiator.management.annotation.OpLog;
import com.radiator.management.annotation.RequiresRole;
import com.radiator.management.common.Result;
import com.radiator.management.entity.StockInOrder;
import com.radiator.management.entity.StockInDetail;
import com.radiator.management.service.StockInService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stock-in")
@RequiredArgsConstructor
@RequiresRole({"purchase_officer", "warehouse_manager"})
public class StockInController {

    private final StockInService stockInService;

    @PostMapping
    @OpLog(module = "入库管理", operation = "创建入库单")
    public Result<Void> createStockInOrder(@RequestBody StockInOrder order, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        stockInService.createStockInOrder(order, userId);
        return Result.success();
    }

    @PutMapping
    @OpLog(module = "入库管理", operation = "更新入库单")
    public Result<Void> updateStockInOrder(@RequestBody StockInOrder order) {
        stockInService.updateStockInOrder(order);
        return Result.success();
    }

    @PutMapping("/{id}/submit")
    @OpLog(module = "入库管理", operation = "提交入库单")
    public Result<Void> submitStockInOrder(@PathVariable Long id) {
        stockInService.submitStockInOrder(id);
        return Result.success();
    }

    @PutMapping("/{id}/approve")
    @OpLog(module = "入库管理", operation = "审核入库单")
    public Result<Void> approveStockInOrder(@PathVariable Long id, HttpServletRequest request) {
        Long approverId = (Long) request.getAttribute("userId");
        stockInService.approveStockInOrder(id, approverId);
        return Result.success();
    }

    @PutMapping("/{id}/reject")
    @OpLog(module = "入库管理", operation = "拒绝入库单")
    public Result<Void> rejectStockInOrder(@PathVariable Long id, @RequestParam String remark) {
        stockInService.rejectStockInOrder(id, remark);
        return Result.success();
    }

    @GetMapping("/page")
    public Result<Page<StockInOrder>> listStockInOrders(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword) {
        return Result.success(stockInService.listStockInOrders(page, size, status, keyword));
    }

    @GetMapping("/{id}")
    public Result<StockInOrder> getStockInOrderById(@PathVariable Long id) {
        return Result.success(stockInService.getStockInOrderById(id));
    }

    @GetMapping("/{id}/details")
    public Result<List<StockInDetail>> getStockInDetails(@PathVariable Long id) {
        return Result.success(stockInService.getStockInDetails(id));
    }
}
