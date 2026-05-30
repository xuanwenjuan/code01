package com.spring.manufacturing.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.spring.manufacturing.annotation.OperationLog;
import com.spring.manufacturing.annotation.RequiresRole;
import com.spring.manufacturing.common.Result;
import com.spring.manufacturing.dto.DefectiveProcessDTO;
import com.spring.manufacturing.dto.ProcessCompleteDTO;
import com.spring.manufacturing.dto.WorkOrderCreateDTO;
import com.spring.manufacturing.entity.ProductionWorkOrder;
import com.spring.manufacturing.entity.WorkOrderProcess;
import com.spring.manufacturing.service.ProductionWorkOrderService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/work-order")
@RequiredArgsConstructor
public class ProductionWorkOrderController {

    private final ProductionWorkOrderService productionWorkOrderService;

    @GetMapping("/page")
    @RequiresRole({"ADMIN", "LEADER", "PROCESSOR", "QUALITY"})
    public Result<IPage<ProductionWorkOrder>> getWorkOrderPage(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long categoryId) {
        IPage<ProductionWorkOrder> pageResult = productionWorkOrderService.getWorkOrderPage(page, size, status, categoryId);
        return Result.success(pageResult);
    }

    @GetMapping("/{id}")
    @RequiresRole({"ADMIN", "LEADER", "PROCESSOR", "QUALITY"})
    public Result<ProductionWorkOrder> getWorkOrderById(@PathVariable Long id) {
        ProductionWorkOrder workOrder = productionWorkOrderService.getById(id);
        return Result.success(workOrder);
    }

    @GetMapping("/{id}/processes")
    @RequiresRole({"ADMIN", "LEADER", "PROCESSOR", "QUALITY"})
    public Result<List<WorkOrderProcess>> getWorkOrderProcesses(@PathVariable Long id) {
        List<WorkOrderProcess> processes = productionWorkOrderService.getWorkOrderProcesses(id);
        return Result.success(processes);
    }

    @PostMapping
    @RequiresRole({"ADMIN", "LEADER"})
    @OperationLog(module = "工单管理", type = "创建", description = "创建生产工单")
    public Result<Long> createWorkOrder(@Valid @RequestBody WorkOrderCreateDTO dto, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        Long workOrderId = productionWorkOrderService.createWorkOrder(dto, userId);
        return Result.success("创建成功", workOrderId);
    }

    @PutMapping("/start-process")
    @RequiresRole({"ADMIN", "LEADER", "PROCESSOR"})
    @OperationLog(module = "工单管理", type = "开始工序", description = "开始生产工序")
    public Result<Void> startProcess(@RequestBody Map<String, Object> params, HttpServletRequest request) {
        Long workOrderId = Long.valueOf(params.get("workOrderId").toString());
        String processCode = (String) params.get("processCode");
        Long userId = (Long) request.getAttribute("userId");
        productionWorkOrderService.startProcess(workOrderId, processCode, userId);
        return Result.success("工序开始", null);
    }

    @PutMapping("/complete-process")
    @RequiresRole({"ADMIN", "LEADER", "PROCESSOR"})
    @OperationLog(module = "工单管理", type = "完成工序", description = "完成生产工序")
    public Result<Void> completeProcess(@Valid @RequestBody ProcessCompleteDTO dto, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        productionWorkOrderService.completeProcess(dto, userId);
        return Result.success("工序完成", null);
    }

    @PutMapping("/defective")
    @RequiresRole({"ADMIN", "LEADER", "QUALITY"})
    @OperationLog(module = "工单管理", type = "次品处理", description = "生产次品处理")
    public Result<Void> processDefective(@Valid @RequestBody DefectiveProcessDTO dto, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        productionWorkOrderService.processDefective(dto, userId);
        return Result.success("处理完成", null);
    }

    @PutMapping("/pause/{id}")
    @RequiresRole({"ADMIN", "LEADER"})
    @OperationLog(module = "工单管理", type = "暂停", description = "暂停生产工单")
    public Result<Void> pauseWorkOrder(@PathVariable Long id, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        productionWorkOrderService.pauseWorkOrder(id, userId);
        return Result.success("工单已暂停", null);
    }

    @PutMapping("/resume/{id}")
    @RequiresRole({"ADMIN", "LEADER"})
    @OperationLog(module = "工单管理", type = "恢复", description = "恢复生产工单")
    public Result<Void> resumeWorkOrder(@PathVariable Long id, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        productionWorkOrderService.resumeWorkOrder(id, userId);
        return Result.success("工单已恢复", null);
    }

    @DeleteMapping("/{id}")
    @RequiresRole({"ADMIN"})
    @OperationLog(module = "工单管理", type = "删除", description = "删除生产工单")
    public Result<Void> deleteWorkOrder(@PathVariable Long id) {
        productionWorkOrderService.removeById(id);
        return Result.success("删除成功", null);
    }
}