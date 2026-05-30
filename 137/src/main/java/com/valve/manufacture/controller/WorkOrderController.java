package com.valve.manufacture.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.valve.manufacture.annotation.RequiresRole;
import com.valve.manufacture.common.Result;
import com.valve.manufacture.constant.RoleConstants;
import com.valve.manufacture.dto.ProcessCompleteDTO;
import com.valve.manufacture.dto.ProcessConfirmDTO;
import com.valve.manufacture.dto.WorkOrderCreateDTO;
import com.valve.manufacture.dto.WorkOrderMaterialDTO;
import com.valve.manufacture.entity.WorkOrder;
import com.valve.manufacture.entity.WorkOrderMaterial;
import com.valve.manufacture.entity.WorkOrderProcess;
import com.valve.manufacture.service.WorkOrderMaterialService;
import com.valve.manufacture.service.WorkOrderProcessService;
import com.valve.manufacture.service.WorkOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/work-orders")
@RequiredArgsConstructor
@RequiresRole({RoleConstants.ADMIN, RoleConstants.PROCESS, RoleConstants.PRODUCTION})
public class WorkOrderController {

    private final WorkOrderService workOrderService;
    private final WorkOrderMaterialService workOrderMaterialService;
    private final WorkOrderProcessService workOrderProcessService;

    @GetMapping
    public Result<Page<WorkOrder>> page(
            @RequestParam(defaultValue = "1") Integer current,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String productName,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long assigneeId,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        Page<WorkOrder> page = workOrderService.pageWithCondition(current, size, productName, status, assigneeId, startDate, endDate);
        return Result.success(page);
    }

    @GetMapping("/pending")
    public Result<List<WorkOrder>> getPendingOrders() {
        List<WorkOrder> list = workOrderService.getPendingOrders();
        return Result.success(list);
    }

    @GetMapping("/in-progress")
    public Result<List<WorkOrder>> getInProgressOrders() {
        List<WorkOrder> list = workOrderService.getInProgressOrders();
        return Result.success(list);
    }

    @GetMapping("/{id}")
    public Result<WorkOrder> getById(@PathVariable Long id) {
        WorkOrder workOrder = workOrderService.getDetail(id);
        return Result.success(workOrder);
    }

    @PostMapping
    @RequiresRole({RoleConstants.ADMIN, RoleConstants.PROCESS})
    public Result<WorkOrder> create(@Valid @RequestBody WorkOrderCreateDTO dto,
                                    @RequestAttribute Long userId) {
        WorkOrder workOrder = new WorkOrder();
        workOrder.setProductName(dto.getProductName());
        workOrder.setProductCategoryId(dto.getProductCategoryId());
        workOrder.setQuantity(dto.getQuantity());
        workOrder.setPriority(dto.getPriority());
        workOrder.setPlanStartDate(dto.getPlanStartDate());
        workOrder.setPlanEndDate(dto.getPlanEndDate());
        workOrder.setAssigneeId(dto.getAssigneeId());
        workOrder.setRemark(dto.getRemark());
        
        WorkOrder created = workOrderService.create(workOrder, userId);
        
        if (dto.getMaterials() != null && !dto.getMaterials().isEmpty()) {
            for (WorkOrderMaterialDTO materialDTO : dto.getMaterials()) {
                if (materialDTO.getBatchId() != null) {
                    workOrderMaterialService.autoLockMaterial(
                            created.getId(),
                            materialDTO.getMaterialId(),
                            materialDTO.getBatchId(),
                            materialDTO.getQuantity(),
                            userId
                    );
                }
            }
        }
        
        return Result.success("创建成功", workOrderService.getDetail(created.getId()));
    }

    @PostMapping("/{id}/start")
    @RequiresRole({RoleConstants.ADMIN, RoleConstants.PRODUCTION})
    public Result<WorkOrder> start(@PathVariable Long id,
                                   @RequestAttribute Long userId) {
        WorkOrder workOrder = workOrderService.start(id, userId);
        return Result.success("开始成功", workOrder);
    }

    @PostMapping("/{id}/complete-process")
    @RequiresRole({RoleConstants.ADMIN, RoleConstants.PRODUCTION})
    public Result<WorkOrder> completeProcess(@PathVariable Long id,
                                             @Valid @RequestBody ProcessCompleteDTO dto,
                                             @RequestAttribute Long userId) {
        WorkOrder workOrder = workOrderService.completeProcess(id, dto.getProcessId(), dto.getWorkHours(), dto.getRemark(), userId);
        return Result.success("工序完成", workOrder);
    }

    @PostMapping("/{id}/pause")
    @RequiresRole({RoleConstants.ADMIN, RoleConstants.PRODUCTION})
    public Result<WorkOrder> pause(@PathVariable Long id,
                                    @RequestBody(required = false) Map<String, String> request) {
        String reason = request != null && request.containsKey("reason") ? request.get("reason") : null;
        WorkOrder workOrder = workOrderService.pause(id, reason);
        return Result.success("暂停成功", workOrder);
    }

    @PostMapping("/{id}/cancel")
    @RequiresRole(RoleConstants.ADMIN)
    public Result<WorkOrder> cancel(@PathVariable Long id,
                                     @RequestBody(required = false) Map<String, String> request) {
        String reason = request != null && request.containsKey("reason") ? request.get("reason") : null;
        workOrderMaterialService.releaseMaterialLock(id, reason);
        WorkOrder workOrder = workOrderService.cancel(id, reason);
        return Result.success("取消成功", workOrder);
    }

    @PutMapping("/{id}/assignee")
    @RequiresRole({RoleConstants.ADMIN, RoleConstants.PROCESS})
    public Result<Void> updateAssignee(@PathVariable Long id,
                                       @RequestBody Map<String, Long> request) {
        Long assigneeId = request.get("assigneeId");
        workOrderService.updateAssignee(id, assigneeId);
        return Result.success("负责人更新成功");
    }

    @PostMapping("/{id}/materials")
    @RequiresRole({RoleConstants.ADMIN, RoleConstants.PRODUCTION})
    public Result<WorkOrderMaterial> receiveMaterial(@PathVariable Long id,
                                                     @Valid @RequestBody WorkOrderMaterialDTO dto,
                                                     @RequestAttribute Long userId) {
        WorkOrderMaterial material = new WorkOrderMaterial();
        material.setWorkOrderId(id);
        material.setMaterialId(dto.getMaterialId());
        material.setBatchId(dto.getBatchId());
        material.setQuantity(dto.getQuantity());
        material.setUnitPrice(dto.getUnitPrice());
        material.setRemark(dto.getRemark());
        material.setReceiverId(userId);
        
        WorkOrderMaterial saved = workOrderMaterialService.receiveMaterial(material);
        return Result.success("领用成功", saved);
    }
    
    @PostMapping("/{id}/release-lock")
    @RequiresRole({RoleConstants.ADMIN, RoleConstants.PRODUCTION})
    public Result<Void> releaseMaterialLock(@PathVariable Long id,
                                            @RequestBody Map<String, String> request) {
        String reason = request.containsKey("reason") ? request.get("reason") : null;
        workOrderMaterialService.releaseMaterialLock(id, reason);
        return Result.success("锁定释放成功");
    }

    @PostMapping("/confirm-process")
    @RequiresRole({RoleConstants.ADMIN, RoleConstants.PROCESS})
    public Result<Void> confirmProcesses(@Valid @RequestBody ProcessConfirmDTO dto,
                                         @RequestAttribute Long userId) {
        workOrderProcessService.confirmProcesses(dto, userId);
        return Result.success("工艺确定成功，原料已锁定");
    }

    @GetMapping("/{id}/processes")
    public Result<List<WorkOrderProcess>> getProcesses(@PathVariable Long id) {
        List<WorkOrderProcess> processes = workOrderProcessService.getByWorkOrderId(id);
        return Result.success(processes);
    }

    @PostMapping("/processes/{processId}/start")
    @RequiresRole({RoleConstants.ADMIN, RoleConstants.PRODUCTION})
    public Result<WorkOrderProcess> startProcess(@PathVariable Long processId,
                                                  @RequestAttribute Long userId) {
        WorkOrderProcess process = workOrderProcessService.startProcess(processId, userId);
        return Result.success("工序开始成功", process);
    }

    @PostMapping("/processes/{processId}/complete")
    @RequiresRole({RoleConstants.ADMIN, RoleConstants.PRODUCTION})
    public Result<WorkOrderProcess> completeProcess(@PathVariable Long processId) {
        WorkOrderProcess process = workOrderProcessService.completeProcess(processId);
        return Result.success("工序完成成功", process);
    }
}
