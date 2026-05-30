package com.firecontrol.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.firecontrol.annotation.OperationLog;
import com.firecontrol.annotation.RequireRole;
import com.firecontrol.common.PageQuery;
import com.firecontrol.common.Result;
import com.firecontrol.common.constant.UserConstants;
import com.firecontrol.dto.ProcessOperationDTO;
import com.firecontrol.dto.WorkOrderDTO;
import com.firecontrol.dto.WorkOrderPickMaterialDTO;
import com.firecontrol.entity.WorkOrder;
import com.firecontrol.entity.WorkOrderLabor;
import com.firecontrol.entity.WorkOrderMaterial;
import com.firecontrol.entity.WorkOrderProcess;
import com.firecontrol.service.WorkOrderService;
import com.firecontrol.vo.WorkOrderProgressVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "生产工单管理", description = "消防组装生产工单管理接口")
@RestController
@RequestMapping("/work-order")
@RequireRole(anyRole = {UserConstants.ROLE_PROCESS, UserConstants.ROLE_PRODUCTION, UserConstants.ROLE_QUALITY, UserConstants.ROLE_ADMIN})
public class WorkOrderController {

    @Resource
    private WorkOrderService workOrderService;

    @Operation(summary = "创建工单")
    @OperationLog(module = "生产工单", operation = "创建工单", description = "创建新的生产工单")
    @PostMapping
    public Result<String> createWorkOrder(@Valid @RequestBody WorkOrderDTO dto) {
        return Result.success(workOrderService.createWorkOrder(dto));
    }

    @Operation(summary = "修改工单")
    @OperationLog(module = "生产工单", operation = "修改工单", description = "修改工单信息")
    @PutMapping
    public Result<Void> updateWorkOrder(@Valid @RequestBody WorkOrderDTO dto) {
        workOrderService.updateWorkOrder(dto);
        return Result.success();
    }

    @Operation(summary = "删除工单")
    @OperationLog(module = "生产工单", operation = "删除工单", description = "删除工单")
    @DeleteMapping("/{id}")
    public Result<Void> deleteWorkOrder(@PathVariable Long id) {
        workOrderService.deleteWorkOrder(id);
        return Result.success();
    }

    @Operation(summary = "根据ID获取工单详情")
    @GetMapping("/{id}")
    public Result<WorkOrder> getWorkOrderById(@PathVariable Long id) {
        return Result.success(workOrderService.getWorkOrderById(id));
    }

    @Operation(summary = "分页查询工单列表")
    @PostMapping("/page")
    public Result<IPage<WorkOrder>> getWorkOrderPage(@RequestBody WorkOrder workOrder, PageQuery pageQuery) {
        return Result.success(workOrderService.getWorkOrderPage(workOrder, pageQuery));
    }

    @Operation(summary = "开始工序")
    @OperationLog(module = "生产工单", operation = "开始工序", description = "开始某道工序的生产")
    @PostMapping("/process/start")
    public Result<Void> startProcess(@Valid @RequestBody ProcessOperationDTO dto) {
        workOrderService.startProcess(dto);
        return Result.success();
    }

    @Operation(summary = "完成工序")
    @OperationLog(module = "生产工单", operation = "完成工序", description = "完成某道工序的生产")
    @PostMapping("/process/complete")
    public Result<Void> completeProcess(@Valid @RequestBody ProcessOperationDTO dto) {
        workOrderService.completeProcess(dto);
        return Result.success();
    }

    @Operation(summary = "暂停工单")
    @OperationLog(module = "生产工单", operation = "暂停工单", description = "暂停工单生产")
    @PutMapping("/{id}/pause")
    public Result<Void> pauseWorkOrder(@PathVariable Long id, @RequestParam(required = false) String reason) {
        workOrderService.pauseWorkOrder(id, reason);
        return Result.success();
    }

    @Operation(summary = "恢复工单")
    @OperationLog(module = "生产工单", operation = "恢复工单", description = "恢复工单生产")
    @PutMapping("/{id}/resume")
    public Result<Void> resumeWorkOrder(@PathVariable Long id) {
        workOrderService.resumeWorkOrder(id);
        return Result.success();
    }

    @Operation(summary = "取消工单")
    @OperationLog(module = "生产工单", operation = "取消工单", description = "取消工单")
    @PutMapping("/{id}/cancel")
    public Result<Void> cancelWorkOrder(@PathVariable Long id, @RequestParam(required = false) String reason) {
        workOrderService.cancelWorkOrder(id, reason);
        return Result.success();
    }

    @Operation(summary = "获取工单工序列表")
    @GetMapping("/{workOrderId}/processes")
    public Result<List<WorkOrderProcess>> getWorkOrderProcesses(@PathVariable Long workOrderId) {
        return Result.success(workOrderService.getWorkOrderProcesses(workOrderId));
    }

    @Operation(summary = "获取工单物料列表")
    @GetMapping("/{workOrderId}/materials")
    public Result<List<WorkOrderMaterial>> getWorkOrderMaterials(@PathVariable Long workOrderId) {
        return Result.success(workOrderService.getWorkOrderMaterials(workOrderId));
    }

    @Operation(summary = "工单领料")
    @OperationLog(module = "生产工单", operation = "工单领料", description = "车间从仓库领取生产物资")
    @PostMapping("/pick-material")
    public Result<Void> pickMaterial(@Valid @RequestBody WorkOrderPickMaterialDTO dto) {
        workOrderService.pickMaterial(dto);
        return Result.success();
    }

    @Operation(summary = "工单退料")
    @OperationLog(module = "生产工单", operation = "工单退料", description = "车间将剩余物资退回仓库")
    @PostMapping("/return-material")
    public Result<Void> returnMaterial(@Valid @RequestBody WorkOrderPickMaterialDTO dto) {
        workOrderService.returnMaterial(dto);
        return Result.success();
    }

    @Operation(summary = "获取工单进度")
    @GetMapping("/{workOrderId}/progress")
    public Result<WorkOrderProgressVO> getWorkOrderProgress(@PathVariable Long workOrderId) {
        return Result.success(workOrderService.getWorkOrderProgress(workOrderId));
    }

    @Operation(summary = "搜索工单")
    @GetMapping("/search")
    public Result<List<WorkOrder>> searchWorkOrders(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) String productCategory) {
        return Result.success(workOrderService.searchWorkOrders(keyword, status, productCategory));
    }

    @Operation(summary = "审核通过工单")
    @OperationLog(module = "生产工单", operation = "审核通过", description = "生产方案审核通过，自动锁定物料库存")
    @RequireRole(anyRole = {UserConstants.ROLE_PRODUCTION, UserConstants.ROLE_ADMIN})
    @PutMapping("/{id}/approve")
    public Result<Void> approveWorkOrder(
            @PathVariable Long id,
            @RequestParam(required = false) String remark) {
        workOrderService.approveWorkOrder(id, remark);
        return Result.success();
    }

    @Operation(summary = "审核驳回工单")
    @OperationLog(module = "生产工单", operation = "审核驳回", description = "生产方案审核驳回")
    @RequireRole(anyRole = {UserConstants.ROLE_PRODUCTION, UserConstants.ROLE_ADMIN})
    @PutMapping("/{id}/reject")
    public Result<Void> rejectWorkOrder(
            @PathVariable Long id,
            @RequestParam(required = false) String remark) {
        workOrderService.rejectWorkOrder(id, remark);
        return Result.success();
    }

    @Operation(summary = "添加工时记录")
    @OperationLog(module = "生产工单", operation = "添加工时", description = "记录工人工时用于成本核算")
    @RequireRole(anyRole = {UserConstants.ROLE_PRODUCTION, UserConstants.ROLE_ADMIN})
    @PostMapping("/labor")
    public Result<Void> addLaborRecord(@Valid @RequestBody WorkOrderLabor labor) {
        workOrderService.addLaborRecord(labor);
        return Result.success();
    }

    @Operation(summary = "获取工单工时记录")
    @GetMapping("/{workOrderId}/labors")
    public Result<List<WorkOrderLabor>> getWorkOrderLabors(@PathVariable Long workOrderId) {
        return Result.success(workOrderService.getWorkOrderLabors(workOrderId));
    }
}
