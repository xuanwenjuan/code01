package com.amber.polish.controller;

import com.amber.polish.annotation.OperationLog;
import com.amber.polish.common.Result;
import com.amber.polish.dto.OrderCompleteDTO;
import com.amber.polish.dto.PolishOrderDTO;
import com.amber.polish.entity.PolishOrder;
import com.amber.polish.service.PolishOrderService;
import com.amber.polish.util.JwtUtil;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/polish-order")
@RequiredArgsConstructor
public class PolishOrderController {

    private final PolishOrderService polishOrderService;
    private final JwtUtil jwtUtil;

    @GetMapping("/page")
    @OperationLog(module = "工单管理", type = "查询", description = "分页查询工单列表")
    public Result<Page<PolishOrder>> getOrderPage(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long polisherId) {
        Page<PolishOrder> page = polishOrderService.getOrderPage(pageNum, pageSize, status, polisherId);
        return Result.success(page);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CONSULTANT')")
    @OperationLog(module = "工单管理", type = "新增", description = "创建打磨工单")
    public Result<Void> createOrder(@Valid @RequestBody PolishOrderDTO dto) {
        polishOrderService.createOrder(dto);
        return Result.success();
    }

    @PutMapping("/{id}/confirm-design")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONSULTANT')")
    @OperationLog(module = "工单管理", type = "修改", description = "确认设计方案并锁定原石")
    public Result<Void> confirmDesign(@PathVariable Long id, HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        Long operatorId = jwtUtil.getUserIdFromToken(token);
        polishOrderService.confirmDesign(id, operatorId);
        return Result.success();
    }

    @PutMapping("/complete")
    @PreAuthorize("hasAnyRole('ADMIN', 'POLISHER')")
    @OperationLog(module = "工单管理", type = "修改", description = "工单完工并核算成本")
    public Result<Map<String, BigDecimal>> completeOrder(@Valid @RequestBody OrderCompleteDTO dto, HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        Long operatorId = jwtUtil.getUserIdFromToken(token);
        Map<String, BigDecimal> costDetail = polishOrderService.completeOrderAndCalculateCost(dto, operatorId);
        return Result.success(costDetail);
    }

    @PutMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CONSULTANT')")
    @OperationLog(module = "工单管理", type = "修改", description = "修改工单信息")
    public Result<Void> updateOrder(@RequestBody PolishOrder polishOrder) {
        polishOrderService.updateById(polishOrder);
        return Result.success();
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONSULTANT', 'POLISHER')")
    @OperationLog(module = "工单管理", type = "修改", description = "更新工单状态")
    public Result<Void> updateOrderStatus(@PathVariable Long id, @RequestParam String status, HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        Long operatorId = jwtUtil.getUserIdFromToken(token);
        polishOrderService.updateOrderStatus(id, status, operatorId);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @OperationLog(module = "工单管理", type = "删除", description = "删除工单")
    public Result<Void> deleteOrder(@PathVariable Long id) {
        polishOrderService.removeById(id);
        return Result.success();
    }

    @GetMapping("/{id}")
    @OperationLog(module = "工单管理", type = "查询", description = "获取工单详情")
    public Result<PolishOrder> getOrderById(@PathVariable Long id) {
        PolishOrder polishOrder = polishOrderService.getById(id);
        return Result.success(polishOrder);
    }
}
