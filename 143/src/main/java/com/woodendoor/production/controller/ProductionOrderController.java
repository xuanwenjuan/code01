package com.woodendoor.production.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.woodendoor.production.annotation.RequireRole;
import com.woodendoor.production.common.Result;
import com.woodendoor.production.entity.OrderProcess;
import com.woodendoor.production.entity.ProductionOrder;
import com.woodendoor.production.service.ProductionOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/production-order")
@RequiredArgsConstructor
@RequireRole({"leader", "designer", "quality", "admin"})
public class ProductionOrderController {

    private final ProductionOrderService productionOrderService;

    @PostMapping
    @RequireRole({"leader", "designer", "admin"})
    public Result<Void> create(@RequestBody ProductionOrder order) {
        productionOrderService.createOrder(order);
        return Result.success();
    }

    @GetMapping("/page")
    public Result<Page<ProductionOrder>> page(@RequestParam(defaultValue = "1") Integer pageNum,
                                              @RequestParam(defaultValue = "10") Integer pageSize,
                                              @RequestParam(required = false) Integer status,
                                              @RequestParam(required = false) Integer isConfirmed) {
        return Result.success(productionOrderService.page(pageNum, pageSize, status, isConfirmed));
    }

    @PutMapping("/{id}/confirm")
    @RequireRole({"leader", "designer", "admin"})
    public Result<Void> confirmOrder(@PathVariable Long id) {
        productionOrderService.confirmOrder(id);
        return Result.success();
    }

    @PutMapping("/{id}/cancel-confirm")
    @RequireRole({"leader", "designer", "admin"})
    public Result<Void> cancelConfirm(@PathVariable Long id) {
        productionOrderService.cancelConfirm(id);
        return Result.success();
    }

    @PutMapping("/{id}/start-process")
    public Result<Void> startProcess(@PathVariable Long id) {
        productionOrderService.startProcess(id);
        return Result.success();
    }

    @PutMapping("/{id}/complete-process")
    public Result<Void> completeProcess(@PathVariable Long id,
                                         @RequestParam(required = false) String remark) {
        productionOrderService.completeProcess(id, remark);
        return Result.success();
    }

    @PutMapping("/{id}/pause")
    @RequireRole({"leader", "admin"})
    public Result<Void> pauseOrder(@PathVariable Long id, @RequestParam String reason) {
        productionOrderService.pauseOrder(id, reason);
        return Result.success();
    }

    @PutMapping("/{id}/resume")
    @RequireRole({"leader", "admin"})
    public Result<Void> resumeOrder(@PathVariable Long id) {
        productionOrderService.resumeOrder(id);
        return Result.success();
    }

    @GetMapping("/{id}/process-list")
    public Result<List<OrderProcess>> getProcessList(@PathVariable Long id) {
        return Result.success(productionOrderService.getProcessList(id));
    }
}