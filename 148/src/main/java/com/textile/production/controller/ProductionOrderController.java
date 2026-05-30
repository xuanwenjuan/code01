package com.textile.production.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.textile.production.annotation.RequiresRole;
import com.textile.production.common.Result;
import com.textile.production.common.RoleConstants;
import com.textile.production.dto.MaterialPickDTO;
import com.textile.production.dto.OrderConfirmDTO;
import com.textile.production.dto.ProcessCompleteDTO;
import com.textile.production.dto.ProductionOrderDTO;
import com.textile.production.entity.OrderMaterial;
import com.textile.production.entity.ProductionOrder;
import com.textile.production.entity.ProductionProcess;
import com.textile.production.entity.MaterialLock;
import com.textile.production.service.MaterialLockService;
import com.textile.production.service.OrderMaterialService;
import com.textile.production.service.ProductionOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/production-order")
@RequiredArgsConstructor
public class ProductionOrderController {

    private final ProductionOrderService orderService;
    private final OrderMaterialService orderMaterialService;
    private final MaterialLockService materialLockService;

    @GetMapping("/page")
    public Result<IPage<ProductionOrder>> getPage(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword) {
        return orderService.getPage(pageNum, pageSize, status, keyword);
    }

    @GetMapping("/{id}")
    public Result<ProductionOrder> getDetail(@PathVariable Long id) {
        return orderService.getDetail(id);
    }

    @GetMapping("/{orderId}/processes")
    public Result<List<ProductionProcess>> getProcesses(@PathVariable Long orderId) {
        return orderService.getProcesses(orderId);
    }

    @GetMapping("/{orderId}/materials")
    public Result<List<OrderMaterial>> getMaterials(@PathVariable Long orderId) {
        return orderMaterialService.getMaterialsByOrderId(orderId);
    }

    @PostMapping
    @RequiresRole({RoleConstants.ADMIN, RoleConstants.TECHNICIAN, RoleConstants.SUPERVISOR})
    public Result<ProductionOrder> createOrder(@Valid @RequestBody ProductionOrderDTO dto) {
        return orderService.createOrder(dto);
    }

    @PutMapping("/{orderId}/start")
    @RequiresRole({RoleConstants.ADMIN, RoleConstants.SUPERVISOR})
    public Result<Void> startOrder(@PathVariable Long orderId) {
        return orderService.startOrder(orderId);
    }

    @PutMapping("/complete-process")
    @RequiresRole({RoleConstants.ADMIN, RoleConstants.SUPERVISOR})
    public Result<Void> completeProcess(@Valid @RequestBody ProcessCompleteDTO dto) {
        return orderService.completeProcess(dto);
    }

    @PutMapping("/{orderId}/suspend")
    @RequiresRole({RoleConstants.ADMIN, RoleConstants.SUPERVISOR})
    public Result<Void> suspendOrder(@PathVariable Long orderId, @RequestParam(required = false) String reason) {
        return orderService.suspendOrder(orderId, reason != null ? reason : "手动暂停");
    }

    @PutMapping("/{orderId}/resume")
    @RequiresRole({RoleConstants.ADMIN, RoleConstants.SUPERVISOR})
    public Result<Void> resumeOrder(@PathVariable Long orderId) {
        return orderService.resumeOrder(orderId);
    }

    @PutMapping("/{orderId}/cancel")
    @RequiresRole({RoleConstants.ADMIN, RoleConstants.SUPERVISOR})
    public Result<Void> cancelOrder(@PathVariable Long orderId, @RequestParam(required = false) String reason) {
        return orderService.cancelOrder(orderId, reason != null ? reason : "手动取消");
    }

    @PostMapping("/pick-material")
    @RequiresRole({RoleConstants.ADMIN, RoleConstants.SUPERVISOR})
    public Result<Void> pickMaterial(@Valid @RequestBody MaterialPickDTO dto) {
        return orderMaterialService.pickMaterial(dto);
    }

    @GetMapping("/with-processes")
    public Result<List<ProductionOrder>> getOrderWithProcesses(
            @RequestParam(required = false) Long id,
            @RequestParam(required = false) String status) {
        return orderService.getOrderWithProcesses(id, status);
    }

    @GetMapping("/statistics/progress")
    public Result<List<Map<String, Object>>> getOrderProgressStatistics(
            @RequestParam(required = false) LocalDateTime startDate,
            @RequestParam(required = false) LocalDateTime endDate) {
        return orderService.getOrderProgressStatistics(startDate, endDate);
    }

    @GetMapping("/statistics/efficiency")
    public Result<List<Map<String, Object>>> getOrderEfficiencyReport(
            @RequestParam(required = false) LocalDateTime startDate,
            @RequestParam(required = false) LocalDateTime endDate) {
        return orderService.getOrderEfficiencyReport(startDate, endDate);
    }

    @GetMapping("/statistics/defective")
    public Result<List<Map<String, Object>>> getDefectiveStatistics(
            @RequestParam(required = false) LocalDateTime startDate,
            @RequestParam(required = false) LocalDateTime endDate) {
        return orderService.getDefectiveStatistics(startDate, endDate);
    }

    @PostMapping("/confirm-process")
    @RequiresRole({RoleConstants.ADMIN, RoleConstants.TECHNICIAN})
    public Result<Void> confirmProcess(@Valid @RequestBody OrderConfirmDTO dto) {
        return orderService.confirmProcess(dto);
    }

    @GetMapping("/{orderId}/material-locks")
    public Result<List<MaterialLock>> getMaterialLocks(@PathVariable Long orderId) {
        return materialLockService.getLocksByOrder(orderId);
    }

    @PutMapping("/material-lock/{lockId}/release")
    @RequiresRole({RoleConstants.ADMIN, RoleConstants.TECHNICIAN, RoleConstants.SUPERVISOR})
    public Result<Void> releaseLock(@PathVariable Long lockId) {
        return materialLockService.releaseLock(lockId);
    }

    @PutMapping("/{orderId}/release-all-locks")
    @RequiresRole({RoleConstants.ADMIN, RoleConstants.TECHNICIAN})
    public Result<Void> releaseAllLocks(@PathVariable Long orderId) {
        return materialLockService.releaseLockByOrder(orderId);
    }
}
