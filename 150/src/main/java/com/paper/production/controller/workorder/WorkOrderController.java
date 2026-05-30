package com.paper.production.controller.workorder;

import com.paper.production.annotation.OperateLog;
import com.paper.production.annotation.RequiresRoles;
import com.paper.production.common.PageQuery;
import com.paper.production.common.PageResult;
import com.paper.production.common.Result;
import com.paper.production.dto.workorder.WorkOrderConfirmDTO;
import com.paper.production.dto.workorder.WorkOrderDTO;
import com.paper.production.dto.workorder.WorkOrderProcessDTO;
import com.paper.production.entity.workorder.WorkOrder;
import com.paper.production.entity.workorder.WorkOrderMaterial;
import com.paper.production.entity.workorder.WorkOrderProcess;
import com.paper.production.enums.RoleEnum;
import com.paper.production.service.workorder.WorkOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Tag(name = "生产工单管理")
@RestController
@RequestMapping("/work-order")
public class WorkOrderController {

    @Resource
    private WorkOrderService workOrderService;

    @Operation(summary = "创建工单")
    @PostMapping
    @RequiresRoles({RoleEnum.PROCESS, RoleEnum.PRODUCTION, RoleEnum.ADMIN})
    @OperateLog(module = "生产工单", operation = "创建工单", description = "创建新的生产工单")
    public Result<Void> create(@Valid @RequestBody WorkOrderDTO dto) {
        workOrderService.createWorkOrder(dto);
        return Result.success();
    }

    @Operation(summary = "修改工单")
    @PutMapping
    @RequiresRoles({RoleEnum.PROCESS, RoleEnum.PRODUCTION, RoleEnum.ADMIN})
    @OperateLog(module = "生产工单", operation = "修改工单", description = "修改生产工单信息")
    public Result<Void> update(@Valid @RequestBody WorkOrderDTO dto) {
        workOrderService.updateWorkOrder(dto);
        return Result.success();
    }

    @Operation(summary = "删除工单")
    @DeleteMapping("/{id}")
    @RequiresRoles({RoleEnum.PRODUCTION, RoleEnum.ADMIN})
    @OperateLog(module = "生产工单", operation = "删除工单", description = "删除生产工单")
    public Result<Void> delete(@PathVariable Long id) {
        workOrderService.deleteWorkOrder(id);
        return Result.success();
    }

    @Operation(summary = "分页查询工单")
    @PostMapping("/page")
    public Result<PageResult<WorkOrder>> page(@RequestBody PageQuery query) {
        return Result.success(workOrderService.queryWorkOrderPage(query));
    }

    @Operation(summary = "按状态分页查询工单")
    @PostMapping("/page/status/{status}")
    public Result<PageResult<WorkOrder>> queryByStatusPage(@PathVariable Integer status, @RequestBody PageQuery query) {
        return Result.success(workOrderService.queryByStatusPage(status, query));
    }

    @Operation(summary = "获取工单详情")
    @GetMapping("/{id}")
    public Result<WorkOrder> getById(@PathVariable Long id) {
        return Result.success(workOrderService.getById(id));
    }

    @Operation(summary = "按状态获取工单列表")
    @GetMapping("/list/status/{status}")
    public Result<List<WorkOrder>> listByStatus(@PathVariable Integer status) {
        return Result.success(workOrderService.listByStatus(status));
    }

    @Operation(summary = "获取待排产工单列表")
    @GetMapping("/list/pending")
    public Result<List<WorkOrder>> getPendingOrders() {
        return Result.success(workOrderService.getPendingOrders());
    }

    @Operation(summary = "获取生产中工单列表")
    @GetMapping("/list/processing")
    public Result<List<WorkOrder>> getProcessingOrders() {
        return Result.success(workOrderService.getProcessingOrders());
    }

    @Operation(summary = "获取已完成工单列表")
    @GetMapping("/list/finished")
    public Result<List<WorkOrder>> getFinishedOrders(
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        return Result.success(workOrderService.getFinishedOrders(startDate, endDate));
    }

    @Operation(summary = "排产工单")
    @PutMapping("/schedule/{id}")
    @RequiresRoles({RoleEnum.PRODUCTION, RoleEnum.ADMIN})
    @OperateLog(module = "生产工单", operation = "排产工单", description = "安排工单开始生产")
    public Result<Void> schedule(@PathVariable Long id) {
        workOrderService.scheduleWorkOrder(id);
        return Result.success();
    }

    @Operation(summary = "批量排产")
    @PutMapping("/schedule/batch")
    @RequiresRoles({RoleEnum.PRODUCTION, RoleEnum.ADMIN})
    @OperateLog(module = "生产工单", operation = "批量排产", description = "批量安排工单开始生产")
    public Result<Void> batchSchedule(@RequestBody List<Long> ids) {
        workOrderService.batchSchedule(ids);
        return Result.success();
    }

    @Operation(summary = "开始工序")
    @PostMapping("/process/start")
    @RequiresRoles({RoleEnum.PRODUCTION, RoleEnum.QUALITY, RoleEnum.ADMIN})
    @OperateLog(module = "生产工单", operation = "开始工序", description = "开始生产工序")
    public Result<Void> startProcess(@Valid @RequestBody WorkOrderProcessDTO dto) {
        workOrderService.startProcess(dto);
        return Result.success();
    }

    @Operation(summary = "完成工序")
    @PostMapping("/process/finish")
    @RequiresRoles({RoleEnum.PRODUCTION, RoleEnum.QUALITY, RoleEnum.ADMIN})
    @OperateLog(module = "生产工单", operation = "完成工序", description = "完成生产工序")
    public Result<Void> finishProcess(@Valid @RequestBody WorkOrderProcessDTO dto) {
        workOrderService.finishProcess(dto);
        return Result.success();
    }

    @Operation(summary = "取消工单")
    @PutMapping("/cancel/{id}")
    @RequiresRoles({RoleEnum.PRODUCTION, RoleEnum.ADMIN})
    @OperateLog(module = "生产工单", operation = "取消工单", description = "取消生产工单")
    public Result<Void> cancel(@PathVariable Long id) {
        workOrderService.cancelWorkOrder(id);
        return Result.success();
    }

    @Operation(summary = "调整工单优先级")
    @PutMapping("/priority/{id}/{priority}")
    @RequiresRoles({RoleEnum.PRODUCTION, RoleEnum.ADMIN})
    @OperateLog(module = "生产工单", operation = "调整优先级", description = "调整工单生产优先级")
    public Result<Void> updatePriority(@PathVariable Long id, @PathVariable Integer priority) {
        workOrderService.updateWorkOrderPriority(id, priority);
        return Result.success();
    }

    @Operation(summary = "获取工单工序记录")
    @GetMapping("/process/{workOrderId}")
    public Result<List<WorkOrderProcess>> getProcesses(@PathVariable Long workOrderId) {
        return Result.success(workOrderService.getWorkOrderProcesses(workOrderId));
    }

    @Operation(summary = "获取工单工序进度")
    @GetMapping("/progress/{workOrderId}")
    public Result<List<Map<String, Object>>> getProcessProgress(@PathVariable Long workOrderId) {
        return Result.success(workOrderService.getProcessProgress(workOrderId));
    }

    @Operation(summary = "获取工单用料清单")
    @GetMapping("/material/{workOrderId}")
    public Result<List<WorkOrderMaterial>> getWorkOrderMaterials(@PathVariable Long workOrderId) {
        return Result.success(workOrderService.getWorkOrderMaterials(workOrderId));
    }

    @Operation(summary = "获取工单统计数据")
    @GetMapping("/statistics")
    public Result<Map<String, Object>> getWorkOrderStatistics() {
        return Result.success(workOrderService.getWorkOrderStatistics());
    }

    @Operation(summary = "获取每日生产统计")
    @GetMapping("/statistics/daily")
    public Result<Map<String, Object>> getDailyStatistics(
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date) {
        return Result.success(workOrderService.getDailyStatistics(date));
    }

    @Operation(summary = "获取生产效率统计")
    @GetMapping("/statistics/efficiency")
    public Result<Map<String, Object>> getProductionEfficiency() {
        return Result.success(workOrderService.getProductionEfficiency());
    }

    @Operation(summary = "工单方案确认并锁定库存")
    @PostMapping("/confirm")
    @RequiresRoles({RoleEnum.PROCESS, RoleEnum.PRODUCTION, RoleEnum.ADMIN})
    @OperateLog(module = "生产工单", operation = "方案确认", description = "确认生产方案并锁定原料库存")
    public Result<Void> confirmWorkOrder(@Valid @RequestBody WorkOrderConfirmDTO dto) {
        workOrderService.confirmWorkOrder(dto);
        return Result.success();
    }
}
