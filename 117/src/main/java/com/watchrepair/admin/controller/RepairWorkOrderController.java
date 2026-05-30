package com.watchrepair.admin.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.watchrepair.admin.annotation.OperationLogger;
import com.watchrepair.admin.common.PageQuery;
import com.watchrepair.admin.common.Result;
import com.watchrepair.admin.dto.RepairWorkOrderDTO;
import com.watchrepair.admin.dto.WorkOrderCompleteDTO;
import com.watchrepair.admin.dto.WorkOrderPlanDTO;
import com.watchrepair.admin.service.RepairWorkOrderService;
import com.watchrepair.admin.vo.RepairWorkOrderVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/workorder")
@RequiredArgsConstructor
public class RepairWorkOrderController {

    private final RepairWorkOrderService workOrderService;

    @GetMapping("/page")
    public Result<Page<RepairWorkOrderVO>> getWorkOrderPage(
            @Valid PageQuery pageQuery,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) String keyword) {
        return Result.success(workOrderService.getWorkOrderPage(pageQuery, status, keyword));
    }

    @GetMapping("/timeout")
    @PreAuthorize("hasAnyRole('2', '4')")
    public Result<List<RepairWorkOrderVO>> getTimeoutWorkOrders() {
        return Result.success(workOrderService.getTimeoutWorkOrders());
    }

    @GetMapping("/{id}")
    public Result<RepairWorkOrderVO> getWorkOrderById(@PathVariable Long id) {
        return Result.success(workOrderService.getWorkOrderById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('2', '4')")
    @OperationLogger("创建修护工单")
    public Result<Void> createWorkOrder(@Valid @RequestBody RepairWorkOrderDTO dto) {
        workOrderService.createWorkOrder(dto);
        return Result.success();
    }

    @PutMapping("/{id}/disassemble")
    @PreAuthorize("hasAnyRole('2', '4')")
    @OperationLogger("开始拆解检测")
    public Result<Void> startDisassemble(@PathVariable Long id, @RequestParam Long technicianId) {
        workOrderService.startDisassemble(id, technicianId);
        return Result.success();
    }

    @PostMapping("/confirm-plan")
    @PreAuthorize("hasAnyRole('1', '4')")
    @OperationLogger("确定修护方案锁定库存")
    public Result<Void> confirmPlan(@Valid @RequestBody WorkOrderPlanDTO dto) {
        workOrderService.confirmPlan(dto);
        return Result.success();
    }

    @PutMapping("/{id}/adjust")
    @PreAuthorize("hasAnyRole('2', '4')")
    @OperationLogger("开始调校走时精度")
    public Result<Void> startAdjust(@PathVariable Long id, @RequestParam BigDecimal laborCost) {
        workOrderService.startAdjust(id, laborCost);
        return Result.success();
    }

    @PutMapping("/{id}/polish")
    @PreAuthorize("hasAnyRole('2', '4')")
    @OperationLogger("开始外观抛光复原")
    public Result<Void> startPolish(@PathVariable Long id, @RequestParam BigDecimal appearanceCost) {
        workOrderService.startPolish(id, appearanceCost);
        return Result.success();
    }

    @PostMapping("/complete")
    @PreAuthorize("hasAnyRole('2', '4')")
    @OperationLogger("完工交付验收并核算成本")
    public Result<Void> completeWorkOrder(@Valid @RequestBody WorkOrderCompleteDTO dto) {
        workOrderService.completeWorkOrder(dto);
        return Result.success();
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('4')")
    @OperationLogger("取消修护工单")
    public Result<Void> cancelWorkOrder(@PathVariable Long id) {
        workOrderService.cancelWorkOrder(id);
        return Result.success();
    }
}