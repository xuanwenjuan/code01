package com.radiator.management.controller;

import com.radiator.management.annotation.OpLog;
import com.radiator.management.common.Result;
import com.radiator.management.entity.ProductionWorkOrder;
import com.radiator.management.entity.WorkOrderMaterial;
import com.radiator.management.service.ProductionWorkOrderService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/work-order")
@RequiredArgsConstructor
public class ProductionWorkOrderController {

    private final ProductionWorkOrderService workOrderService;

    @PostMapping
    @OpLog(module = "生产工单", operation = "创建工单")
    public Result<Void> createWorkOrder(@RequestBody ProductionWorkOrder workOrder) {
        workOrderService.createWorkOrder(workOrder);
        return Result.success();
    }

    @PutMapping
    @OpLog(module = "生产工单", operation = "更新工单")
    public Result<Void> updateWorkOrder(@RequestBody ProductionWorkOrder workOrder) {
        workOrderService.updateWorkOrder(workOrder);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @OpLog(module = "生产工单", operation = "删除工单")
    public Result<Void> deleteWorkOrder(@PathVariable Long id) {
        workOrderService.deleteWorkOrder(id);
        return Result.success();
    }

    @GetMapping
    public Result<List<ProductionWorkOrder>> list(@RequestParam(required = false) String status) {
        return Result.success(workOrderService.list(status));
    }

    @GetMapping("/{id}")
    public Result<ProductionWorkOrder> getById(@PathVariable Long id) {
        return Result.success(workOrderService.getById(id));
    }

    @PutMapping("/{id}/start")
    @OpLog(module = "生产工单", operation = "开始生产")
    public Result<Void> startProduction(@PathVariable Long id, HttpServletRequest request) {
        Long leaderId = (Long) request.getAttribute("userId");
        workOrderService.startProduction(id, leaderId);
        return Result.success();
    }

    @PutMapping("/{id}/next-process")
    @OpLog(module = "生产工单", operation = "工序流转")
    public Result<Void> nextProcess(@PathVariable Long id) {
        workOrderService.nextProcess(id);
        return Result.success();
    }

    @PutMapping("/{id}/pause")
    @OpLog(module = "生产工单", operation = "暂停工单")
    public Result<Void> pauseOrder(@PathVariable Long id) {
        workOrderService.pauseOrder(id);
        return Result.success();
    }

    @PostMapping("/material")
    @OpLog(module = "生产工单", operation = "添加工单物料")
    public Result<Void> addMaterial(@RequestBody WorkOrderMaterial material) {
        workOrderService.addMaterial(material);
        return Result.success();
    }

    @GetMapping("/{id}/materials")
    public Result<List<WorkOrderMaterial>> getMaterials(@PathVariable Long id) {
        return Result.success(workOrderService.getMaterials(id));
    }
}