package com.construction.material.controller;

import com.construction.material.annotation.OperationLog;
import com.construction.material.annotation.RequiresRole;
import com.construction.material.common.PageQuery;
import com.construction.material.common.PageResult;
import com.construction.material.common.Result;
import com.construction.material.dto.MaterialWorkOrderDTO;
import com.construction.material.dto.WorkOrderAuditDTO;
import com.construction.material.dto.WorkOrderQueryDTO;
import com.construction.material.dto.WorkOrderVerifyDTO;
import com.construction.material.entity.MaterialWorkOrder;
import com.construction.material.service.MaterialWorkOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/work-order")
@RequiredArgsConstructor
public class MaterialWorkOrderController {

    private final MaterialWorkOrderService workOrderService;

    @PostMapping
    @RequiresRole({"ADMIN", "SUPERVISOR", "WAREHOUSE_KEEPER"})
    @OperationLog(module = "工单管理模块", operation = "创建工单", description = "创建建材领用工单")
    public Result<Void> createWorkOrder(@Valid @RequestBody MaterialWorkOrderDTO dto) {
        workOrderService.createWorkOrder(dto);
        return Result.success();
    }

    @PostMapping("/audit")
    @RequiresRole({"ADMIN", "SUPERVISOR"})
    @OperationLog(module = "工单管理模块", operation = "审核工单", description = "审核建材领用工单")
    public Result<Void> auditWorkOrder(@Valid @RequestBody WorkOrderAuditDTO dto) {
        workOrderService.auditWorkOrder(dto);
        return Result.success();
    }

    @PostMapping("/outbound/{id}")
    @RequiresRole({"ADMIN", "WAREHOUSE_KEEPER"})
    @OperationLog(module = "工单管理模块", operation = "工单出库", description = "工单建材出库操作")
    public Result<Void> outboundWorkOrder(@PathVariable Long id) {
        workOrderService.outboundWorkOrder(id);
        return Result.success();
    }

    @PostMapping("/verify")
    @RequiresRole({"ADMIN", "SUPERVISOR", "WAREHOUSE_KEEPER"})
    @OperationLog(module = "工单管理模块", operation = "工单核销", description = "工单建材使用核销")
    public Result<Void> verifyWorkOrder(@Valid @RequestBody WorkOrderVerifyDTO dto) {
        workOrderService.verifyWorkOrder(dto);
        return Result.success();
    }

    @GetMapping("/{id}")
    public Result<MaterialWorkOrder> getWorkOrder(@PathVariable Long id) {
        return Result.success(workOrderService.getWorkOrder(id));
    }

    @GetMapping("/page")
    public Result<PageResult<MaterialWorkOrder>> getWorkOrderPage(
            PageQuery pageQuery,
            WorkOrderQueryDTO queryDTO) {
        return Result.success(workOrderService.getWorkOrderPage(pageQuery, queryDTO));
    }

    @PostMapping("/cancel/{id}")
    @RequiresRole({"ADMIN", "SUPERVISOR"})
    @OperationLog(module = "工单管理模块", operation = "取消工单", description = "取消建材领用工单")
    public Result<Void> cancelWorkOrder(@PathVariable Long id) {
        workOrderService.cancelWorkOrder(id);
        return Result.success();
    }

    @GetMapping("/statistics")
    @RequiresRole({"ADMIN", "SUPERVISOR", "FINANCE"})
    public Result<Map<String, Object>> getWorkOrderStatistics(WorkOrderQueryDTO queryDTO) {
        return Result.success(workOrderService.getWorkOrderStatistics(queryDTO));
    }

    @GetMapping("/statistics/project")
    @RequiresRole({"ADMIN", "SUPERVISOR", "FINANCE"})
    public Result<List<Map<String, Object>>> getProjectStatistics(WorkOrderQueryDTO queryDTO) {
        return Result.success(workOrderService.getProjectStatistics(queryDTO));
    }

    @GetMapping("/statistics/team")
    @RequiresRole({"ADMIN", "SUPERVISOR", "FINANCE"})
    public Result<List<Map<String, Object>>> getTeamStatistics(WorkOrderQueryDTO queryDTO) {
        return Result.success(workOrderService.getTeamStatistics(queryDTO));
    }

    @GetMapping("/statistics/trend")
    @RequiresRole({"ADMIN", "SUPERVISOR", "FINANCE"})
    public Result<List<Map<String, Object>>> getStatusTrend(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startDate,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endDate) {
        return Result.success(workOrderService.getStatusTrend(startDate, endDate));
    }
}
