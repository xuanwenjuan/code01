package com.battery.shell.controller;

import com.battery.shell.annotation.RequireRole;
import com.battery.shell.common.Result;
import com.battery.shell.constant.RoleConstant;
import com.battery.shell.dto.ProcessDTO;
import com.battery.shell.dto.ProductionOrderDTO;
import com.battery.shell.entity.ProductionLog;
import com.battery.shell.entity.ProductionOrder;
import com.battery.shell.service.ProductionOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/order")
@RequiredArgsConstructor
public class ProductionOrderController {

    private final ProductionOrderService productionOrderService;

    @PostMapping
    @RequireRole({RoleConstant.PROCESS, RoleConstant.ADMIN})
    public Result<Void> createOrder(@Valid @RequestBody ProductionOrderDTO dto) {
        productionOrderService.createOrder(dto);
        return Result.success("工单创建成功", null);
    }

    @PutMapping
    @RequireRole({RoleConstant.PROCESS, RoleConstant.ADMIN})
    public Result<Void> updateOrder(@Valid @RequestBody ProductionOrderDTO dto) {
        productionOrderService.updateOrder(dto);
        return Result.success("工单更新成功", null);
    }

    @DeleteMapping("/{id}")
    @RequireRole({RoleConstant.ADMIN})
    public Result<Void> deleteOrder(@PathVariable Long id) {
        productionOrderService.deleteOrder(id);
        return Result.success("工单删除成功", null);
    }

    @GetMapping("/{id}")
    public Result<ProductionOrder> getOrderById(@PathVariable Long id) {
        return Result.success(productionOrderService.getOrderById(id));
    }

    @GetMapping("/list")
    public Result<List<ProductionOrder>> getOrderList(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long categoryId) {
        return Result.success(productionOrderService.getOrderList(status, categoryId));
    }

    @GetMapping("/{id}/logs")
    public Result<List<ProductionLog>> getOrderLogs(@PathVariable Long id) {
        return Result.success(productionOrderService.getOrderLogs(id));
    }

    @PostMapping("/confirm-process")
    @RequireRole({RoleConstant.PROCESS, RoleConstant.ADMIN})
    public Result<Void> confirmProcessAndLockStock(
            @RequestParam Long orderId,
            @RequestParam BigDecimal materialUsage) {
        productionOrderService.confirmProcessAndLockStock(orderId, materialUsage);
        return Result.success("工艺确认完成，库存已锁定", null);
    }

    @PostMapping("/process/start")
    @RequireRole({RoleConstant.LINE, RoleConstant.ADMIN})
    public Result<Void> startProcess(@Valid @RequestBody ProcessDTO dto) {
        productionOrderService.startProcess(dto);
        return Result.success("工序开始成功", null);
    }

    @PostMapping("/process/complete")
    @RequireRole({RoleConstant.LINE, RoleConstant.ADMIN})
    public Result<Void> completeProcess(@Valid @RequestBody ProcessDTO dto) {
        productionOrderService.completeProcess(dto);
        return Result.success("工序完成成功", null);
    }

    @GetMapping("/{id}/cost")
    @RequireRole({RoleConstant.PROCESS, RoleConstant.QUALITY, RoleConstant.ADMIN})
    public Result<Map<String, Object>> getOrderCostDetail(@PathVariable Long id) {
        return Result.success(productionOrderService.getOrderCostDetail(id));
    }

    @PutMapping("/{id}/pause")
    @RequireRole({RoleConstant.PROCESS, RoleConstant.ADMIN})
    public Result<Void> pauseOrder(@PathVariable Long id) {
        productionOrderService.pauseOrder(id);
        return Result.success("工单暂停成功", null);
    }

    @PutMapping("/{id}/resume")
    @RequireRole({RoleConstant.PROCESS, RoleConstant.ADMIN})
    public Result<Void> resumeOrder(@PathVariable Long id) {
        productionOrderService.resumeOrder(id);
        return Result.success("工单恢复成功", null);
    }

    @PutMapping("/{id}/cancel")
    @RequireRole({RoleConstant.PROCESS, RoleConstant.ADMIN})
    public Result<Void> cancelOrder(@PathVariable Long id) {
        productionOrderService.cancelOrder(id);
        return Result.success("工单取消成功", null);
    }
}
