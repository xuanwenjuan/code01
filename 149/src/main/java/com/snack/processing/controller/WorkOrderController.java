package com.snack.processing.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.snack.processing.common.Result;
import com.snack.processing.dto.workorder.*;
import com.snack.processing.entity.WorkOrder;
import com.snack.processing.entity.WorkOrderMaterial;
import com.snack.processing.entity.WorkOrderProcess;
import com.snack.processing.service.WorkOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/work-order")
@RequiredArgsConstructor
@Tag(name = "生产工单管理", description = "生产工单的创建、工序流转、用料登记等")
public class WorkOrderController {

    private final WorkOrderService workOrderService;

    @PostMapping
    @Operation(summary = "创建工单")
    public Result<WorkOrder> createWorkOrder(@Valid @RequestBody WorkOrderAddDTO dto) {
        return workOrderService.createWorkOrder(dto);
    }

    @PutMapping("/{id}/start")
    @Operation(summary = "开始生产")
    public Result<Void> startProduction(@PathVariable Long id) {
        return workOrderService.startProduction(id);
    }

    @PutMapping("/process/start")
    @Operation(summary = "开始工序")
    public Result<Void> startProcess(@RequestBody ProcessStartDTO dto) {
        return workOrderService.startProcess(dto);
    }

    @PutMapping("/process/complete")
    @Operation(summary = "完成工序")
    public Result<Void> completeProcess(@RequestBody ProcessCompleteDTO dto) {
        return workOrderService.completeProcess(dto);
    }

    @PutMapping("/{id}/pause")
    @Operation(summary = "暂停工单")
    public Result<Void> pauseWorkOrder(@PathVariable Long id) {
        return workOrderService.pauseWorkOrder(id);
    }

    @PutMapping("/{id}/resume")
    @Operation(summary = "恢复工单")
    public Result<Void> resumeWorkOrder(@PathVariable Long id) {
        return workOrderService.resumeWorkOrder(id);
    }

    @PutMapping("/{id}/cancel")
    @Operation(summary = "取消工单")
    public Result<Void> cancelWorkOrder(@PathVariable Long id) {
        return workOrderService.cancelWorkOrder(id);
    }

    @PostMapping("/{workOrderId}/material-usage")
    @Operation(summary = "登记用料")
    public Result<Void> recordMaterialUsage(
            @PathVariable Long workOrderId,
            @RequestParam Long materialId,
            @RequestParam String batchNo,
            @RequestParam BigDecimal actualQuantity,
            @RequestParam(required = false) BigDecimal wasteQuantity) {
        return workOrderService.recordMaterialUsage(workOrderId, materialId, batchNo, actualQuantity, wasteQuantity);
    }

    @GetMapping("/{id}")
    @Operation(summary = "获取工单详情")
    public Result<WorkOrder> getWorkOrderDetail(@PathVariable Long id) {
        return workOrderService.getWorkOrderDetail(id);
    }

    @GetMapping("/page")
    @Operation(summary = "分页查询工单列表")
    public Result<IPage<WorkOrder>> getWorkOrderPage(WorkOrderQueryDTO dto) {
        return workOrderService.getWorkOrderPage(dto);
    }

    @GetMapping("/{workOrderId}/processes")
    @Operation(summary = "获取工单工序列表")
    public Result<List<WorkOrderProcess>> getWorkOrderProcesses(@PathVariable Long workOrderId) {
        return workOrderService.getWorkOrderProcesses(workOrderId);
    }

    @GetMapping("/{workOrderId}/materials")
    @Operation(summary = "获取工单用料列表")
    public Result<List<WorkOrderMaterial>> getWorkOrderMaterials(@PathVariable Long workOrderId) {
        return workOrderService.getWorkOrderMaterials(workOrderId);
    }
}
