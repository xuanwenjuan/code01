package com.zongshi.brush.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.zongshi.brush.annotation.OperationLog;
import com.zongshi.brush.annotation.RequiresRoles;
import com.zongshi.brush.common.Result;
import com.zongshi.brush.dto.CraftConfirmDTO;
import com.zongshi.brush.dto.OrderCompleteDTO;
import com.zongshi.brush.dto.ProductionOrderDTO;
import com.zongshi.brush.entity.OrderMaterial;
import com.zongshi.brush.entity.OrderStatusLog;
import com.zongshi.brush.entity.ProductionOrder;
import com.zongshi.brush.service.ProductionOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/order")
@RequiredArgsConstructor
public class ProductionOrderController {

    private final ProductionOrderService productionOrderService;

    @PostMapping
    @OperationLog(module = "精工制笔生产工单", type = "新增", description = "创建生产工单")
    @RequiresRoles({"ADMIN"})
    public Result<Long> createOrder(@Valid @RequestBody ProductionOrderDTO dto) {
        Long id = productionOrderService.createOrder(dto);
        return Result.success("创建工单成功", id);
    }

    @PostMapping("/confirm-craft")
    @OperationLog(module = "精工制笔生产工单", type = "工艺确认", description = "确认工艺并锁定原料")
    @RequiresRoles({"ADMIN", "BRUSH_WORKER"})
    public Result<Void> confirmCraft(@Valid @RequestBody CraftConfirmDTO dto) {
        productionOrderService.confirmCraft(dto);
        return Result.success("工艺确认成功，原料已锁定");
    }

    @PutMapping
    @OperationLog(module = "精工制笔生产工单", type = "修改", description = "修改生产工单")
    @RequiresRoles({"ADMIN"})
    public Result<Void> updateOrder(@Valid @RequestBody ProductionOrderDTO dto) {
        productionOrderService.updateOrder(dto);
        return Result.success("修改工单成功");
    }

    @DeleteMapping("/{id}")
    @OperationLog(module = "精工制笔生产工单", type = "删除", description = "删除生产工单")
    @RequiresRoles({"ADMIN"})
    public Result<Void> deleteOrder(@PathVariable Long id) {
        productionOrderService.deleteOrder(id);
        return Result.success("删除工单成功");
    }

    @GetMapping("/{id}")
    @OperationLog(module = "精工制笔生产工单", type = "查询", description = "查询工单详情")
    public Result<ProductionOrder> getOrderById(@PathVariable Long id) {
        ProductionOrder order = productionOrderService.getOrderById(id);
        return Result.success(order);
    }

    @GetMapping("/page")
    @OperationLog(module = "精工制笔生产工单", type = "查询", description = "分页查询工单列表")
    public Result<Page<ProductionOrder>> getOrderPage(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String orderNo,
            @RequestParam(required = false) Integer orderStatus,
            @RequestParam(required = false) Long categoryId) {
        Page<ProductionOrder> result = productionOrderService.getOrderPage(pageNum, pageSize, orderNo, orderStatus, categoryId);
        return Result.success(result);
    }

    @GetMapping("/{id}/materials")
    @OperationLog(module = "精工制笔生产工单", type = "查询", description = "查询工单原料明细")
    public Result<List<OrderMaterial>> getOrderMaterials(@PathVariable Long id) {
        List<OrderMaterial> list = productionOrderService.getOrderMaterials(id);
        return Result.success(list);
    }

    @GetMapping("/{id}/status-logs")
    @OperationLog(module = "精工制笔生产工单", type = "查询", description = "查询工单状态流转日志")
    public Result<List<OrderStatusLog>> getOrderStatusLogs(@PathVariable Long id) {
        List<OrderStatusLog> list = productionOrderService.getOrderStatusLogs(id);
        return Result.success(list);
    }

    @PutMapping("/{id}/process/{status}")
    @OperationLog(module = "精工制笔生产工单", type = "状态流转", description = "工单工序流转")
    @RequiresRoles({"ADMIN", "BRUSH_WORKER"})
    public Result<Void> startProcessing(@PathVariable Long id, @PathVariable Integer status) {
        productionOrderService.startProcessing(id, status);
        return Result.success("工单状态更新成功");
    }

    @PutMapping("/complete")
    @OperationLog(module = "精工制笔生产工单", type = "完成", description = "工单完成入库，自动核算成本")
    @RequiresRoles({"ADMIN", "WAREHOUSE_ADMIN"})
    public Result<Void> completeOrder(@Valid @RequestBody OrderCompleteDTO dto) {
        productionOrderService.completeOrder(dto);
        return Result.success("工单已完成，成本已核算");
    }

    @PutMapping("/{id}/pause")
    @OperationLog(module = "精工制笔生产工单", type = "暂停", description = "暂停工单，自动解锁原料")
    @RequiresRoles({"ADMIN"})
    public Result<Void> pauseOrder(@PathVariable Long id) {
        productionOrderService.pauseOrder(id);
        return Result.success("工单已暂停，原料已解锁");
    }

    @PutMapping("/{id}/resume")
    @OperationLog(module = "精工制笔生产工单", type = "恢复", description = "恢复工单")
    @RequiresRoles({"ADMIN"})
    public Result<Void> resumeOrder(@PathVariable Long id) {
        productionOrderService.resumeOrder(id);
        return Result.success("工单已恢复");
    }
}
