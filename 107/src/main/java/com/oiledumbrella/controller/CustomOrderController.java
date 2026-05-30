package com.oiledumbrella.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.oiledumbrella.annotation.RequiresRole;
import com.oiledumbrella.common.Result;
import com.oiledumbrella.dto.CustomOrderCreateDTO;
import com.oiledumbrella.dto.OrderCompleteDTO;
import com.oiledumbrella.dto.OrderMaterialLockDTO;
import com.oiledumbrella.entity.CustomOrder;
import com.oiledumbrella.entity.OrderFlowLog;
import com.oiledumbrella.service.CustomOrderService;
import com.oiledumbrella.vo.CustomOrderDetailVO;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/order")
@RequiredArgsConstructor
public class CustomOrderController {

    private final CustomOrderService orderService;

    @GetMapping("/page")
    public Result<Page<CustomOrder>> page(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String orderStatus,
            @RequestParam(required = false) String keyword) {
        Page<CustomOrder> page = orderService.page(pageNum, pageSize, orderStatus, keyword);
        return Result.success(page);
    }

    @PostMapping
    @RequiresRole({"ADMIN", "STORE_MANAGER"})
    public Result<Void> create(@Valid @RequestBody CustomOrderCreateDTO dto, HttpServletRequest request) {
        Long operatorId = (Long) request.getAttribute("userId");
        orderService.create(dto, operatorId);
        return Result.success("创建成功", null);
    }

    @PutMapping("/pay-deposit/{orderId}")
    @RequiresRole({"ADMIN", "STORE_MANAGER", "FINANCE"})
    public Result<Void> payDeposit(@PathVariable Long orderId, HttpServletRequest request) {
        Long operatorId = (Long) request.getAttribute("userId");
        orderService.payDeposit(orderId, operatorId);
        return Result.success("支付成功", null);
    }

    @PutMapping("/confirm-design")
    @RequiresRole({"ADMIN", "STORE_MANAGER"})
    public Result<Void> confirmDesign(@Valid @RequestBody OrderMaterialLockDTO lockDTO, HttpServletRequest request) {
        Long operatorId = (Long) request.getAttribute("userId");
        orderService.confirmDesign(lockDTO, operatorId);
        return Result.success("定稿成功，原料已锁定", null);
    }

    @PutMapping("/complete")
    @RequiresRole({"ADMIN", "CRAFTSMAN"})
    public Result<Void> completeOrder(@Valid @RequestBody OrderCompleteDTO completeDTO, HttpServletRequest request) {
        Long operatorId = (Long) request.getAttribute("userId");
        orderService.completeOrder(completeDTO, operatorId);
        return Result.success("工单完工成功", null);
    }

    @PutMapping("/assign-artisan/{orderId}")
    @RequiresRole({"ADMIN", "STORE_MANAGER"})
    public Result<Void> assignArtisan(@PathVariable Long orderId,
                                       @RequestParam Long artisanId,
                                       HttpServletRequest request) {
        Long operatorId = (Long) request.getAttribute("userId");
        orderService.assignArtisan(orderId, artisanId, operatorId);
        return Result.success("分配成功", null);
    }

    @PutMapping("/cancel/{orderId}")
    @RequiresRole({"ADMIN", "STORE_MANAGER"})
    public Result<Void> cancelOrder(@PathVariable Long orderId,
                                     @RequestParam(required = false) String reason,
                                     HttpServletRequest request) {
        Long operatorId = (Long) request.getAttribute("userId");
        orderService.cancelOrder(orderId, operatorId, reason);
        return Result.success("取消成功", null);
    }

    @GetMapping("/{orderId}")
    public Result<CustomOrderDetailVO> getDetail(@PathVariable Long orderId) {
        CustomOrderDetailVO detail = orderService.getDetail(orderId);
        return Result.success(detail);
    }

    @GetMapping("/{orderId}/flow-logs")
    public Result<List<OrderFlowLog>> getFlowLogs(@PathVariable Long orderId) {
        List<OrderFlowLog> logs = orderService.getFlowLogs(orderId);
        return Result.success(logs);
    }

    @PutMapping
    @RequiresRole({"ADMIN", "STORE_MANAGER"})
    public Result<Void> update(@RequestBody CustomOrder order) {
        orderService.update(order);
        return Result.success("更新成功", null);
    }
}
