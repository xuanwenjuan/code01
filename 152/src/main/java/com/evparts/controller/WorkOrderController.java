package com.evparts.controller;

import com.evparts.annotation.OperationLog;
import com.evparts.annotation.RequireRole;
import com.evparts.common.PageResult;
import com.evparts.common.Result;
import com.evparts.dto.BatchWorkOrderDTO;
import com.evparts.dto.WorkOrderDTO;
import com.evparts.dto.WorkOrderProcessDTO;
import com.evparts.dto.WorkOrderQueryDTO;
import com.evparts.entity.MaterialLockLog;
import com.evparts.entity.WorkOrder;
import com.evparts.service.WorkOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Tag(name = "生产工单管理", description = "工单创建、投产、工序流转、质检、完工")
@RestController
@RequestMapping("/work-order")
public class WorkOrderController {

    @Autowired
    private WorkOrderService workOrderService;

    @Operation(summary = "分页查询工单详情")
    @GetMapping("/detail-page")
    public Result<PageResult<WorkOrder>> getDetailPage(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String orderNo,
            @RequestParam(required = false) String productName,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String orderStatus,
            @RequestParam(required = false) String workshop,
            @RequestParam(required = false) Long operatorId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        return Result.success(workOrderService.getDetailPage(
                pageNum, pageSize, orderNo, productName, categoryId, orderStatus,
                workshop, operatorId, startDate, endDate
        ));
    }

    @Operation(summary = "分页查询工单")
    @GetMapping("/page")
    public Result<PageResult<WorkOrder>> getPage(WorkOrderQueryDTO queryDTO) {
        return Result.success(workOrderService.getPage(queryDTO));
    }

    @Operation(summary = "获取工单详情")
    @GetMapping("/{id}")
    public Result<WorkOrder> getById(@PathVariable Long id) {
        return Result.success(workOrderService.getById(id));
    }

    @Operation(summary = "创建工单")
    @OperationLog(operation = "创建生产工单")
    @RequireRole({"PRODUCTION", "ADMIN", "PROCESS"})
    @PostMapping
    public Result<Void> create(@Valid @RequestBody WorkOrderDTO dto) {
        workOrderService.create(dto);
        return Result.success();
    }

    @Operation(summary = "修改工单")
    @OperationLog(operation = "修改生产工单")
    @RequireRole({"PRODUCTION", "ADMIN"})
    @PutMapping
    public Result<Void> update(@Valid @RequestBody WorkOrderDTO dto) {
        workOrderService.update(dto);
        return Result.success();
    }

    @Operation(summary = "工单投产")
    @OperationLog(operation = "工单投产")
    @RequireRole({"PRODUCTION", "ADMIN"})
    @PutMapping("/{id}/start")
    public Result<Void> startProduction(@PathVariable Long id) {
        workOrderService.startProduction(id);
        return Result.success();
    }

    @Operation(summary = "完成工序")
    @OperationLog(operation = "完成工序")
    @RequireRole({"PRODUCTION", "ADMIN"})
    @PutMapping("/process/complete")
    public Result<Void> completeProcess(@Valid @RequestBody WorkOrderProcessDTO dto) {
        workOrderService.completeProcess(dto.getProcessId(), dto);
        return Result.success();
    }

    @Operation(summary = "工序质检")
    @OperationLog(operation = "工序质检")
    @RequireRole({"QUALITY", "ADMIN"})
    @PutMapping("/process/quality-check")
    public Result<Void> qualityCheck(@Valid @RequestBody WorkOrderProcessDTO dto) {
        workOrderService.qualityCheck(dto.getProcessId(), dto);
        return Result.success();
    }

    @Operation(summary = "暂停工单")
    @OperationLog(operation = "暂停工单")
    @RequireRole({"PRODUCTION", "ADMIN"})
    @PutMapping("/{id}/suspend")
    public Result<Void> suspend(@PathVariable Long id) {
        workOrderService.suspend(id);
        return Result.success();
    }

    @Operation(summary = "恢复工单")
    @OperationLog(operation = "恢复工单")
    @RequireRole({"PRODUCTION", "ADMIN"})
    @PutMapping("/{id}/resume")
    public Result<Void> resume(@PathVariable Long id) {
        workOrderService.resume(id);
        return Result.success();
    }

    @Operation(summary = "取消工单")
    @OperationLog(operation = "取消工单")
    @RequireRole({"PRODUCTION", "ADMIN"})
    @PutMapping("/{id}/cancel")
    public Result<Void> cancel(@PathVariable Long id) {
        workOrderService.cancel(id);
        return Result.success();
    }

    @Operation(summary = "批量更新工单状态")
    @OperationLog(operation = "批量更新工单状态")
    @RequireRole({"PRODUCTION", "ADMIN"})
    @PutMapping("/batch/status")
    public Result<Void> batchUpdateStatus(@Valid @RequestBody BatchWorkOrderDTO dto) {
        workOrderService.batchUpdateStatus(dto);
        return Result.success();
    }

    @Operation(summary = "工单领料")
    @OperationLog(operation = "工单领料")
    @RequireRole({"PRODUCTION", "ADMIN", "PURCHASE"})
    @PutMapping("/material/pick")
    public Result<Void> pickMaterial(
            @RequestParam Long materialId,
            @RequestParam Long stockId,
            @RequestParam BigDecimal quantity) {
        workOrderService.pickMaterial(materialId, stockId, quantity);
        return Result.success();
    }

    @Operation(summary = "获取工单统计")
    @GetMapping("/stats")
    public Result<Map<String, Object>> getStats(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        return Result.success(workOrderService.getStats(startDate, endDate));
    }

    @Operation(summary = "确认工艺并锁定原料库存")
    @OperationLog(operation = "确认工艺并锁定库存")
    @RequireRole({"PROCESS", "ADMIN"})
    @PutMapping("/{id}/confirm-process")
    public Result<Void> confirmProcess(@PathVariable Long id) {
        workOrderService.confirmProcess(id);
        return Result.success();
    }

    @Operation(summary = "释放工单原料库存锁定")
    @OperationLog(operation = "释放库存锁定")
    @RequireRole({"PROCESS", "ADMIN", "PRODUCTION"})
    @PutMapping("/{id}/release-lock")
    public Result<Void> releaseStockLock(@PathVariable Long id) {
        workOrderService.releaseStockLock(id);
        return Result.success();
    }

    @Operation(summary = "获取工单原料锁定记录")
    @GetMapping("/{id}/material-locks")
    public Result<List<MaterialLockLog>> getMaterialLocks(@PathVariable Long id) {
        return Result.success(workOrderService.getMaterialLocks(id));
    }

}
