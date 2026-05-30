package com.aluminum.extrusion.controller;

import com.aluminum.extrusion.annotation.RequireRole;
import com.aluminum.extrusion.common.Result;
import com.aluminum.extrusion.dto.WorkOrderQueryDTO;
import com.aluminum.extrusion.entity.WorkOrder;
import com.aluminum.extrusion.enums.RoleEnum;
import com.aluminum.extrusion.service.WorkOrderService;
import com.aluminum.extrusion.vo.WorkOrderDetailVO;
import com.baomidou.mybatisplus.core.metadata.IPage;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/workorder")
@RequiredArgsConstructor
public class WorkOrderController {

    private final WorkOrderService workOrderService;

    @PostMapping
    @RequireRole({RoleEnum.ADMIN, RoleEnum.TEAM_LEADER, RoleEnum.PROCESS_ENGINEER})
    public Result<Void> createWorkOrder(@Valid @RequestBody WorkOrder workOrder) {
        workOrderService.createWorkOrder(workOrder);
        return Result.success("工单创建成功");
    }

    @PutMapping("/{id}/process")
    @RequireRole({RoleEnum.ADMIN, RoleEnum.PROCESS_ENGINEER})
    public Result<Void> confirmProcess(
            @PathVariable Long id,
            @RequestParam String extrusionProcess,
            @RequestParam String moldCode,
            @RequestParam(required = false) BigDecimal heatingTemp,
            @RequestParam(required = false) BigDecimal extrusionSpeed) {
        workOrderService.confirmProcess(id, extrusionProcess, moldCode, heatingTemp, extrusionSpeed);
        return Result.success("工艺确认成功，原料已锁定");
    }

    @PutMapping("/{id}/next")
    @RequireRole({RoleEnum.ADMIN, RoleEnum.TEAM_LEADER, RoleEnum.PROCESS_ENGINEER})
    public Result<Void> nextProcess(
            @PathVariable Long id,
            @RequestParam(required = false) BigDecimal outputQuantity,
            @RequestParam(required = false) BigDecimal lossQuantity) {
        workOrderService.nextProcess(id, outputQuantity, lossQuantity);
        return Result.success("已进入下一工序");
    }

    @PutMapping("/{id}/jump")
    @RequireRole({RoleEnum.ADMIN, RoleEnum.TEAM_LEADER})
    public Result<Void> jumpToProcess(
            @PathVariable Long id,
            @RequestParam Integer targetStatus) {
        workOrderService.jumpToProcess(id, targetStatus);
        return Result.success("已跳转工序");
    }

    @PutMapping("/{id}/resume")
    @RequireRole({RoleEnum.ADMIN, RoleEnum.TEAM_LEADER})
    public Result<Void> resumeOrder(@PathVariable Long id) {
        workOrderService.resumeOrder(id);
        return Result.success("工单已恢复");
    }

    @DeleteMapping("/{id}")
    @RequireRole({RoleEnum.ADMIN, RoleEnum.TEAM_LEADER})
    public Result<Void> cancelOrder(@PathVariable Long id) {
        workOrderService.cancelOrder(id);
        return Result.success("工单已取消");
    }

    @PostMapping("/page")
    public Result<IPage<WorkOrder>> getOrderPage(@Valid @RequestBody WorkOrderQueryDTO queryDTO) {
        IPage<WorkOrder> page = workOrderService.getOrderPage(queryDTO);
        return Result.success(page);
    }

    @GetMapping("/pending")
    public Result<List<WorkOrder>> getPendingOrders() {
        List<WorkOrder> list = workOrderService.getPendingOrders();
        return Result.success(list);
    }

    @GetMapping("/processing")
    public Result<List<WorkOrder>> getProcessingOrders() {
        List<WorkOrder> list = workOrderService.getProcessingOrders();
        return Result.success(list);
    }

    @GetMapping("/{id}")
    public Result<WorkOrderDetailVO> getById(@PathVariable Long id) {
        WorkOrderDetailVO vo = workOrderService.getOrderDetail(id);
        return Result.success(vo);
    }
}
