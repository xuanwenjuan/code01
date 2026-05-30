package com.gearbox.manage.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.gearbox.manage.annotation.RequiresRole;
import com.gearbox.manage.common.Result;
import com.gearbox.manage.dto.WorkOrderDTO;
import com.gearbox.manage.entity.WorkOrder;
import com.gearbox.manage.entity.WorkOrderMaterial;
import com.gearbox.manage.service.WorkOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workOrder")
@RequiredArgsConstructor
public class WorkOrderController {

    private final WorkOrderService workOrderService;

    @GetMapping("/page")
    public Result<Page<WorkOrder>> listPage(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority) {
        return Result.success(workOrderService.listPage(pageNum, pageSize, status, priority));
    }

    @GetMapping("/{id}")
    public Result<WorkOrder> getById(@PathVariable Long id) {
        return Result.success(workOrderService.getById(id));
    }

    @PostMapping
    @RequiresRole({"ADMIN", "PROCESS_ENGINEER"})
    public Result<WorkOrder> create(@Valid @RequestBody WorkOrderDTO dto) {
        return Result.success(workOrderService.createWorkOrder(dto));
    }

    @PutMapping("/{id}")
    @RequiresRole({"ADMIN", "PROCESS_ENGINEER"})
    public Result<Void> update(@PathVariable Long id, @Valid @RequestBody WorkOrderDTO dto) {
        return workOrderService.updateWorkOrder(id, dto) ? Result.success() : Result.error("更新失败");
    }

    @DeleteMapping("/{id}")
    @RequiresRole({"ADMIN"})
    public Result<Void> delete(@PathVariable Long id) {
        return workOrderService.deleteWorkOrder(id) ? Result.success() : Result.error("删除失败");
    }

    @PostMapping("/{id}/start")
    @RequiresRole({"ADMIN", "TEAM_LEADER"})
    public Result<Void> startProduction(@PathVariable Long id) {
        return workOrderService.startProduction(id) ? Result.success() : Result.error("开始生产失败");
    }

    @PostMapping("/{id}/pause")
    @RequiresRole({"ADMIN", "TEAM_LEADER"})
    public Result<Void> pause(@PathVariable Long id) {
        return workOrderService.pauseWorkOrder(id) ? Result.success() : Result.error("暂停失败");
    }

    @PostMapping("/{id}/complete")
    @RequiresRole({"ADMIN", "QUALITY_INSPECTOR"})
    public Result<Void> complete(@PathVariable Long id) {
        return workOrderService.completeWorkOrder(id) ? Result.success() : Result.error("完成失败");
    }

    @GetMapping("/{id}/materials")
    public Result<List<WorkOrderMaterial>> getMaterials(@PathVariable Long id) {
        return Result.success(workOrderService.getMaterialsByWorkOrderId(id));
    }

    @GetMapping("/statistics")
    public Result<java.util.Map<String, Object>> getStatistics() {
        return Result.success(workOrderService.getStatistics());
    }
}
