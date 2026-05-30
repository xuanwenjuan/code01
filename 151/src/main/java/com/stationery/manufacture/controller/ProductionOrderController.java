package com.stationery.manufacture.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.stationery.manufacture.common.RequireRole;
import com.stationery.manufacture.common.Result;
import com.stationery.manufacture.entity.OrderMaterial;
import com.stationery.manufacture.entity.ProductionOrder;
import com.stationery.manufacture.service.ProductionOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/order")
@Tag(name = "生产工单管理")
public class ProductionOrderController {

    private final ProductionOrderService orderService;

    public ProductionOrderController(ProductionOrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    @Operation(summary = "创建工单")
    @RequireRole({"PRODUCTION_LEADER", "ADMIN", "DESIGNER"})
    public Result<Void> create(@Valid @RequestBody ProductionOrder order) {
        orderService.createOrder(order);
        return Result.success();
    }

    @PutMapping
    @Operation(summary = "修改工单")
    @RequireRole({"PRODUCTION_LEADER", "ADMIN"})
    public Result<Void> update(@Valid @RequestBody ProductionOrder order) {
        orderService.updateOrder(order);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除工单")
    @RequireRole({"PRODUCTION_LEADER", "ADMIN"})
    public Result<Void> delete(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return Result.success();
    }

    @GetMapping("/{id}")
    @Operation(summary = "获取工单详情")
    @RequireRole({"PRODUCTION_LEADER", "ADMIN", "DESIGNER", "INSPECTOR"})
    public Result<ProductionOrder> getById(@PathVariable Long id) {
        return Result.success(orderService.getOrderById(id));
    }

    @GetMapping("/page")
    @Operation(summary = "分页查询工单")
    @RequireRole({"PRODUCTION_LEADER", "ADMIN", "DESIGNER", "INSPECTOR"})
    public Result<Page<ProductionOrder>> getPage(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Integer orderStatus,
            @RequestParam(required = false) String productName,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Integer priority) {
        return Result.success(orderService.getOrderPage(pageNum, pageSize,
                orderStatus, productName, categoryId, priority));
    }

    @PutMapping("/{id}/start")
    @Operation(summary = "开始生产")
    @RequireRole({"PRODUCTION_LEADER", "ADMIN"})
    public Result<Void> startProduction(@PathVariable Long id) {
        orderService.startProduction(id);
        return Result.success();
    }

    @PutMapping("/{orderId}/process/{processId}/complete")
    @Operation(summary = "完成工序")
    @RequireRole({"PRODUCTION_LEADER", "ADMIN"})
    public Result<Void> completeProcess(
            @PathVariable Long orderId,
            @PathVariable Long processId,
            @RequestParam BigDecimal workingHours,
            @RequestParam(required = false) String remark) {
        orderService.completeProcess(orderId, processId, workingHours, remark);
        return Result.success();
    }

    @PutMapping("/{id}/inspection")
    @Operation(summary = "质检")
    @RequireRole({"INSPECTOR", "ADMIN"})
    public Result<Void> qualityInspection(
            @PathVariable Long id,
            @RequestParam Integer qualified,
            @RequestParam Integer defective) {
        orderService.qualityInspection(id, qualified, defective);
        return Result.success();
    }

    @PutMapping("/{id}/finish")
    @Operation(summary = "工单完结")
    @RequireRole({"PRODUCTION_LEADER", "ADMIN"})
    public Result<Void> finishOrder(@PathVariable Long id) {
        orderService.finishOrder(id);
        return Result.success();
    }

    @PostMapping("/material")
    @Operation(summary = "添加工单用料")
    @RequireRole({"PRODUCTION_LEADER", "ADMIN"})
    public Result<Void> addMaterial(@Valid @RequestBody OrderMaterial material) {
        orderService.addMaterial(material);
        return Result.success();
    }

    @DeleteMapping("/material/{id}")
    @Operation(summary = "删除工单用料")
    @RequireRole({"PRODUCTION_LEADER", "ADMIN"})
    public Result<Void> removeMaterial(@PathVariable Long id) {
        orderService.removeMaterial(id);
        return Result.success();
    }
}
