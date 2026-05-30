package com.fitness.manufacture.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.fitness.manufacture.annotation.RequiresRoles;
import com.fitness.manufacture.common.PageQuery;
import com.fitness.manufacture.common.Result;
import com.fitness.manufacture.dto.WorkOrderDTO;
import com.fitness.manufacture.dto.WorkOrderQueryDTO;
import com.fitness.manufacture.entity.WorkOrder;
import com.fitness.manufacture.entity.WorkOrderMaterial;
import com.fitness.manufacture.entity.WorkOrderProcess;
import com.fitness.manufacture.service.WorkOrderMaterialService;
import com.fitness.manufacture.service.WorkOrderProcessService;
import com.fitness.manufacture.service.WorkOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "生产工单管理")
@RestController
@RequestMapping("/api/work-orders")
@RequiredArgsConstructor
public class WorkOrderController {

    private final WorkOrderService workOrderService;
    private final WorkOrderProcessService workOrderProcessService;
    private final WorkOrderMaterialService workOrderMaterialService;

    @Operation(summary = "创建工单")
    @PostMapping
    @RequiresRoles(postCodes = {"PROCESS", "ADMIN"})
    public Result<Void> saveWorkOrder(@Valid @RequestBody WorkOrderDTO dto) {
        workOrderService.saveWorkOrder(dto);
        return Result.success();
    }

    @Operation(summary = "修改工单")
    @PutMapping
    @RequiresRoles(postCodes = {"PROCESS", "ADMIN"})
    public Result<Void> updateWorkOrder(@Valid @RequestBody WorkOrderDTO dto) {
        workOrderService.updateWorkOrder(dto);
        return Result.success();
    }

    @Operation(summary = "删除工单")
    @DeleteMapping("/{id}")
    @RequiresRoles(postCodes = {"PROCESS", "ADMIN"})
    public Result<Void> deleteWorkOrder(@PathVariable Long id) {
        workOrderService.deleteWorkOrder(id);
        return Result.success();
    }

    @Operation(summary = "获取工单分页列表")
    @GetMapping("/page")
    public Result<IPage<WorkOrder>> getWorkOrderPage(PageQuery query,
                                                     @RequestParam(required = false) Long productId,
                                                     @RequestParam(required = false) Integer status,
                                                     @RequestParam(required = false) Long lineLeaderId) {
        return Result.success(workOrderService.getWorkOrderPage(query, productId, status, lineLeaderId));
    }

    @Operation(summary = "获取工单列表")
    @GetMapping("/list")
    public Result<List<WorkOrder>> getWorkOrderList(@RequestParam(required = false) Long productId,
                                                    @RequestParam(required = false) Integer status) {
        return Result.success(workOrderService.getWorkOrderList(productId, status));
    }

    @Operation(summary = "获取工单详情")
    @GetMapping("/{id}")
    public Result<WorkOrder> getWorkOrderById(@PathVariable Long id) {
        return Result.success(workOrderService.getById(id));
    }

    @Operation(summary = "分配工单")
    @PutMapping("/{id}/assign")
    public Result<Void> assignWorkOrder(@PathVariable Long id, @RequestParam Long lineLeaderId) {
        workOrderService.assignWorkOrder(id, lineLeaderId);
        return Result.success();
    }

    @Operation(summary = "暂停工单")
    @PutMapping("/{id}/pause")
    public Result<Void> pauseWorkOrder(@PathVariable Long id, @RequestParam(required = false) String reason) {
        workOrderService.pauseWorkOrder(id, reason);
        return Result.success();
    }

    @Operation(summary = "恢复工单")
    @PutMapping("/{id}/resume")
    public Result<Void> resumeWorkOrder(@PathVariable Long id) {
        workOrderService.resumeWorkOrder(id);
        return Result.success();
    }

    @Operation(summary = "完成工单")
    @PutMapping("/{id}/complete")
    public Result<Void> completeWorkOrder(@PathVariable Long id) {
        workOrderService.completeWorkOrder(id);
        return Result.success();
    }

    @Operation(summary = "取消工单")
    @PutMapping("/{id}/cancel")
    public Result<Void> cancelWorkOrder(@PathVariable Long id, @RequestParam(required = false) String reason) {
        workOrderService.cancelWorkOrder(id, reason);
        return Result.success();
    }

    @Operation(summary = "获取工序列表")
    @GetMapping("/{workOrderId}/processes")
    public Result<List<WorkOrderProcess>> getProcessesByWorkOrderId(@PathVariable Long workOrderId) {
        return Result.success(workOrderProcessService.getProcessesByWorkOrderId(workOrderId));
    }

    @Operation(summary = "开始工序")
    @PutMapping("/processes/{id}/start")
    public Result<Void> startProcess(@PathVariable Long id) {
        workOrderProcessService.startProcess(id);
        return Result.success();
    }

    @Operation(summary = "完成工序")
    @PutMapping("/processes/{id}/complete")
    public Result<Void> completeProcess(@PathVariable Long id) {
        workOrderProcessService.completeProcess(id);
        return Result.success();
    }

    @Operation(summary = "跳过工序")
    @PutMapping("/processes/{id}/skip")
    public Result<Void> skipProcess(@PathVariable Long id, @RequestParam(required = false) String reason) {
        workOrderProcessService.skipProcess(id, reason);
        return Result.success();
    }

    @Operation(summary = "获取工单物料列表")
    @GetMapping("/{workOrderId}/materials")
    public Result<List<WorkOrderMaterial>> getMaterialsByWorkOrderId(@PathVariable Long workOrderId) {
        return Result.success(workOrderMaterialService.getMaterialsByWorkOrderId(workOrderId));
    }

    @Operation(summary = "领用物料")
    @PutMapping("/materials/{id}/pick")
    public Result<Void> pickMaterial(@PathVariable Long id) {
        workOrderMaterialService.pickMaterial(id);
        return Result.success();
    }

    @Operation(summary = "退回物料")
    @PutMapping("/materials/{id}/return")
    public Result<Void> returnMaterial(@PathVariable Long id) {
        workOrderMaterialService.returnMaterial(id);
        return Result.success();
    }

    @Operation(summary = "审核工单")
    @PutMapping("/{id}/audit")
    @RequiresRoles(postCodes = {"PROCESS", "ADMIN"})
    public Result<Void> auditWorkOrder(@PathVariable Long id,
                                       @RequestParam Integer auditResult,
                                       @RequestParam(required = false) String remark) {
        workOrderService.auditWorkOrder(id, auditResult, remark);
        return Result.success();
    }

    @Operation(summary = "启动工单")
    @PutMapping("/{id}/start")
    @RequiresRoles(postCodes = {"LINE_LEADER", "PROCESS", "ADMIN"})
    public Result<Void> startWorkOrder(@PathVariable Long id) {
        workOrderService.startWorkOrder(id);
        workOrderMaterialService.allocateMaterials(id);
        return Result.success();
    }

    @Operation(summary = "质量检验")
    @PutMapping("/processes/{id}/quality-check")
    @RequiresRoles(postCodes = {"QC", "ADMIN"})
    public Result<Void> qualityCheck(@PathVariable Long id,
                                     @RequestParam String result,
                                     @RequestParam(required = false) String issue) {
        workOrderProcessService.qualityCheck(id, result, issue);
        return Result.success();
    }

    @Operation(summary = "多条件组合分页查询工单")
    @PostMapping("/search")
    public Result<IPage<WorkOrder>> searchWorkOrders(@RequestBody WorkOrderQueryDTO queryDTO) {
        return Result.success(workOrderService.getWorkOrderPageByConditions(queryDTO));
    }
}
