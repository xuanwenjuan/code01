package com.flange.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.flange.common.Result;
import com.flange.dto.ProductionLossDto;
import com.flange.dto.ProductionOrderDto;
import com.flange.dto.QualityInspectionDto;
import com.flange.entity.ProductionOrder;
import com.flange.entity.ProductionLoss;
import com.flange.entity.QualityInspection;
import com.flange.entity.WorkHours;
import com.flange.service.ProductionOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@Tag(name = "生产工单管理")
@RestController
@RequestMapping("/api/order")
@RequiredArgsConstructor
public class ProductionOrderController {

    private final ProductionOrderService orderService;

    @Operation(summary = "获取工单列表")
    @GetMapping
    public Result<IPage<ProductionOrder>> getOrderPage(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long categoryId) {
        return Result.success(orderService.getOrderPage(page, size, status, categoryId));
    }

    @Operation(summary = "获取工单详情")
    @GetMapping("/{id}")
    public Result<ProductionOrder> getOrderById(@PathVariable Long id) {
        return Result.success(orderService.getOrderById(id));
    }

    @Operation(summary = "创建工单")
    @PostMapping
    public Result<Void> createOrder(@Valid @RequestBody ProductionOrderDto dto) {
        orderService.createOrder(dto);
        return Result.success();
    }

    @Operation(summary = "备料确认")
    @PutMapping("/confirm-material/{orderId}")
    public Result<Void> confirmMaterial(
            @PathVariable Long orderId,
            @RequestParam(required = false) String remark) {
        orderService.confirmMaterial(orderId, remark);
        return Result.success();
    }

    @Operation(summary = "开始生产")
    @PutMapping("/start/{orderId}")
    public Result<Void> startProduction(@PathVariable Long orderId) {
        orderService.startProduction(orderId);
        return Result.success();
    }

    @Operation(summary = "完成当前工序")
    @PutMapping("/complete-process/{orderId}")
    public Result<Void> completeProcess(
            @PathVariable Long orderId,
            @RequestParam(defaultValue = "0") Integer qualifiedQuantity,
            @RequestParam(defaultValue = "0") Integer scrapQuantity,
            @RequestParam(defaultValue = "0") BigDecimal laborHours,
            @RequestParam(defaultValue = "0") BigDecimal machineHours,
            @RequestParam(required = false) String remark) {
        orderService.completeProcess(orderId, qualifiedQuantity, scrapQuantity, laborHours, machineHours, remark);
        return Result.success();
    }

    @Operation(summary = "创建质检记录")
    @PostMapping("/inspection")
    public Result<Void> createInspection(@Valid @RequestBody QualityInspectionDto dto) {
        orderService.createInspection(dto);
        return Result.success();
    }

    @Operation(summary = "审批质检记录")
    @PutMapping("/inspection/approve/{inspectionId}")
    public Result<Void> approveInspection(
            @PathVariable Long inspectionId,
            @RequestParam String approvalResult,
            @RequestParam(required = false) String approvalRemark) {
        orderService.approveInspection(inspectionId, approvalResult, approvalRemark);
        return Result.success();
    }

    @Operation(summary = "记录生产损耗")
    @PostMapping("/loss")
    public Result<Void> recordLoss(@Valid @RequestBody ProductionLossDto dto) {
        orderService.recordLoss(dto);
        return Result.success();
    }

    @Operation(summary = "获取质检记录列表")
    @GetMapping("/inspection")
    public Result<IPage<QualityInspection>> getInspectionPage(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Long orderId,
            @RequestParam(required = false) String status) {
        return Result.success(orderService.getInspectionPage(page, size, orderId, status));
    }

    @Operation(summary = "获取生产损耗列表")
    @GetMapping("/loss")
    public Result<IPage<ProductionLoss>> getLossPage(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Long orderId,
            @RequestParam(required = false) String lossType) {
        return Result.success(orderService.getLossPage(page, size, orderId, lossType));
    }

    @Operation(summary = "获取工时记录列表")
    @GetMapping("/work-hours")
    public Result<IPage<WorkHours>> getWorkHoursPage(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Long orderId) {
        return Result.success(orderService.getWorkHoursPage(page, size, orderId));
    }
}
