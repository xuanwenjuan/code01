package com.camping.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.camping.annotation.Log;
import com.camping.common.Result;
import com.camping.context.UserContext;
import com.camping.entity.GroupOrder;
import com.camping.entity.OrderMaterial;
import com.camping.entity.OrderMember;
import com.camping.service.GroupOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/group-order")
@RequiredArgsConstructor
public class GroupOrderController {

    private final GroupOrderService groupOrderService;

    @GetMapping("/page")
    @Log(module = "团购订单", operation = "查询订单列表")
    public Result<Page<GroupOrder>> page(@RequestParam(defaultValue = "1") Integer pageNum,
                                         @RequestParam(defaultValue = "10") Integer pageSize,
                                         @RequestParam(required = false) Integer status,
                                         @RequestParam(required = false) Long leaderId) {
        Page<GroupOrder> page = groupOrderService.page(pageNum, pageSize, status, leaderId);
        return Result.success(page);
    }

    @GetMapping("/my")
    @Log(module = "团购订单", operation = "查询我的订单")
    public Result<Page<GroupOrder>> myOrders(@RequestParam(defaultValue = "1") Integer pageNum,
                                             @RequestParam(defaultValue = "10") Integer pageSize,
                                             @RequestParam(required = false) Integer status) {
        Page<GroupOrder> page = groupOrderService.page(pageNum, pageSize, status, UserContext.getUserId());
        return Result.success(page);
    }

    @GetMapping("/{id}")
    @Log(module = "团购订单", operation = "查询订单详情")
    public Result<GroupOrder> detail(@PathVariable Long id) {
        GroupOrder order = groupOrderService.detail(id);
        return Result.success(order);
    }

    @GetMapping("/status-count")
    @Log(module = "团购订单", operation = "查询订单状态统计")
    public Result<Map<Integer, Long>> getOrderStatusCount() {
        Map<Integer, Long> countMap = groupOrderService.getOrderStatusCount();
        return Result.success(countMap);
    }

    @PostMapping
    @Log(module = "团购订单", operation = "创建团购")
    public Result<Void> createGroup(@Valid @RequestBody GroupOrder order) {
        groupOrderService.createGroup(order);
        return Result.success();
    }

    @PostMapping("/join")
    @Log(module = "团购订单", operation = "参团")
    public Result<Void> joinGroup(@Valid @RequestBody OrderMember member) {
        groupOrderService.joinGroup(member);
        return Result.success();
    }

    @PutMapping("/confirm-requirement")
    @Log(module = "团购订单", operation = "确认定制需求")
    public Result<Void> confirmRequirement(@RequestBody Map<String, Object> params) {
        Long orderId = Long.valueOf(params.get("orderId").toString());
        String requirements = params.get("requirements").toString();
        groupOrderService.confirmRequirement(orderId, requirements);
        return Result.success();
    }

    @PutMapping("/allocate-materials")
    @Log(module = "团购订单", operation = "分配物料")
    public Result<Void> allocateMaterials(@RequestBody Map<String, Object> params) {
        Long orderId = Long.valueOf(params.get("orderId").toString());
        @SuppressWarnings("unchecked")
        List<OrderMaterial> materials = (List<OrderMaterial>) params.get("materials");
        groupOrderService.allocateMaterials(orderId, materials);
        return Result.success();
    }

    @PutMapping("/ship")
    @Log(module = "团购订单", operation = "发货")
    public Result<Void> shipOrder(@RequestBody Map<String, Object> params) {
        Long orderId = Long.valueOf(params.get("orderId").toString());
        String trackingNo = params.get("trackingNo").toString();
        groupOrderService.shipOrder(orderId, trackingNo);
        return Result.success();
    }

    @PutMapping("/complete/{orderId}")
    @Log(module = "团购订单", operation = "确认收货")
    public Result<Void> completeOrder(@PathVariable Long orderId) {
        groupOrderService.completeOrder(orderId);
        return Result.success();
    }

    @PutMapping("/refund/apply")
    @Log(module = "团购订单", operation = "申请售后")
    public Result<Void> applyRefund(@RequestBody Map<String, Object> params) {
        Long orderId = Long.valueOf(params.get("orderId").toString());
        String reason = params.get("reason").toString();
        groupOrderService.applyRefund(orderId, reason);
        return Result.success();
    }

    @PutMapping("/refund/handle")
    @Log(module = "团购订单", operation = "处理售后")
    public Result<Void> handleRefund(@RequestBody Map<String, Object> params) {
        Long orderId = Long.valueOf(params.get("orderId").toString());
        Boolean agree = Boolean.valueOf(params.get("agree").toString());
        String comment = params.get("comment").toString();
        groupOrderService.handleRefund(orderId, agree, comment);
        return Result.success();
    }
}
