package com.construction.embedded.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.construction.embedded.annotation.RequiresRole;
import com.construction.embedded.common.Result;
import com.construction.embedded.constant.RoleConstants;
import com.construction.embedded.dto.ProductionOrderDTO;
import com.construction.embedded.entity.ProductionOrder;
import com.construction.embedded.service.CostAccountingService;
import com.construction.embedded.service.ProductionOrderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/order")
public class ProductionOrderController {

    @Autowired
    private ProductionOrderService productionOrderService;

    @Autowired
    private CostAccountingService costAccountingService;

    @GetMapping
    public Result<IPage<ProductionOrder>> list(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        IPage<ProductionOrder> page = productionOrderService.list(status, pageNum, pageSize);
        return Result.success(page);
    }

    @GetMapping("/{id}")
    public Result<ProductionOrder> getById(@PathVariable Long id) {
        ProductionOrder order = productionOrderService.getById(id);
        return Result.success(order);
    }

    @PostMapping
    @RequiresRole({RoleConstants.TECHNICIAN, RoleConstants.TEAM_LEADER, RoleConstants.ADMIN})
    public Result<Void> createOrder(@Valid @RequestBody ProductionOrderDTO dto) {
        productionOrderService.createOrder(dto);
        return Result.success("创建成功", null);
    }

    @PutMapping
    @RequiresRole({RoleConstants.TECHNICIAN, RoleConstants.TEAM_LEADER, RoleConstants.ADMIN})
    public Result<Void> updateOrder(@Valid @RequestBody ProductionOrderDTO dto) {
        productionOrderService.updateOrder(dto);
        return Result.success("更新成功", null);
    }

    @DeleteMapping("/{id}")
    @RequiresRole({RoleConstants.TECHNICIAN, RoleConstants.ADMIN})
    public Result<Void> deleteOrder(@PathVariable Long id) {
        productionOrderService.deleteOrder(id);
        return Result.success("删除成功", null);
    }

    @PutMapping("/start/{id}")
    @RequiresRole({RoleConstants.TEAM_LEADER, RoleConstants.ADMIN})
    public Result<Void> startProduction(@PathVariable Long id) {
        productionOrderService.startProduction(id);
        return Result.success("开始生产", null);
    }

    @PutMapping("/next/{id}")
    @RequiresRole({RoleConstants.TEAM_LEADER, RoleConstants.ADMIN})
    public Result<Void> nextStatus(@PathVariable Long id) {
        productionOrderService.nextStatus(id);
        return Result.success("状态流转成功", null);
    }

    @PutMapping("/suspend/{id}")
    @RequiresRole({RoleConstants.TEAM_LEADER, RoleConstants.INSPECTOR, RoleConstants.ADMIN})
    public Result<Void> suspendOrder(
            @PathVariable Long id,
            @RequestParam String reason) {
        productionOrderService.suspendOrder(id, reason);
        return Result.success("暂停成功", null);
    }

    @PutMapping("/resume/{id}")
    @RequiresRole({RoleConstants.TEAM_LEADER, RoleConstants.ADMIN})
    public Result<Void> resumeOrder(@PathVariable Long id) {
        productionOrderService.resumeOrder(id);
        return Result.success("恢复生产成功", null);
    }

    @PutMapping("/quantity/{id}")
    @RequiresRole({RoleConstants.TEAM_LEADER, RoleConstants.INSPECTOR, RoleConstants.ADMIN})
    public Result<Void> updateActualQuantity(
            @PathVariable Long id,
            @RequestParam Integer actualQuantity,
            @RequestParam(defaultValue = "0") Integer defectiveQuantity) {
        productionOrderService.updateActualQuantity(id, actualQuantity, defectiveQuantity);
        return Result.success("产量更新成功", null);
    }

    @GetMapping("/cost/{id}")
    @RequiresRole({RoleConstants.TECHNICIAN, RoleConstants.TEAM_LEADER, RoleConstants.ADMIN})
    public Result<BigDecimal> calculateOrderCost(@PathVariable Long id) {
        BigDecimal cost = costAccountingService.calculateOrderCost(id);
        return Result.success(cost);
    }
}
