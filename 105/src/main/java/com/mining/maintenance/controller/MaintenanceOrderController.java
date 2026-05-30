package com.mining.maintenance.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.mining.maintenance.annotation.Log;
import com.mining.maintenance.annotation.RequireRole;
import com.mining.maintenance.common.Result;
import com.mining.maintenance.constant.RoleConstant;
import com.mining.maintenance.dto.MaintenanceOrderDTO;
import com.mining.maintenance.entity.MaintenanceOrder;
import com.mining.maintenance.entity.MaintenanceOrderLog;
import com.mining.maintenance.service.MaintenanceOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/maintenance/order")
@RequiredArgsConstructor
public class MaintenanceOrderController {

    private final MaintenanceOrderService maintenanceOrderService;

    @PostMapping("/report")
    @RequireRole({RoleConstant.ADMIN, RoleConstant.DISPATCHER})
    @Log(operationModule = "维保工单", operationType = "新增", operationDesc = "上报设备故障")
    public Result<Void> report(@Valid @RequestBody MaintenanceOrderDTO dto) {
        maintenanceOrderService.reportOrder(dto);
        return Result.success();
    }

    @PutMapping("/{id}/assign")
    @RequireRole({RoleConstant.ADMIN, RoleConstant.DISPATCHER})
    @Log(operationModule = "维保工单", operationType = "修改", operationDesc = "指派维保技师")
    public Result<Void> assign(@PathVariable Long id, @RequestParam Long technicianId) {
        maintenanceOrderService.assignOrder(id, technicianId);
        return Result.success();
    }

    @PutMapping("/{id}/accept")
    @RequireRole({RoleConstant.ADMIN, RoleConstant.TECHNICIAN})
    @Log(operationModule = "维保工单", operationType = "修改", operationDesc = "技师接单")
    public Result<Void> accept(@PathVariable Long id) {
        maintenanceOrderService.acceptOrder(id);
        return Result.success();
    }

    @PutMapping("/{id}/start")
    @RequireRole({RoleConstant.ADMIN, RoleConstant.TECHNICIAN})
    @Log(operationModule = "维保工单", operationType = "修改", operationDesc = "开始维修")
    public Result<Void> start(@PathVariable Long id) {
        maintenanceOrderService.startMaintenance(id);
        return Result.success();
    }

    @PutMapping("/{id}/complete")
    @RequireRole({RoleConstant.ADMIN, RoleConstant.TECHNICIAN})
    @Log(operationModule = "维保工单", operationType = "修改", operationDesc = "完成维修")
    public Result<Void> complete(
            @PathVariable Long id,
            @RequestParam String content,
            @RequestParam(required = false) String partsUsed,
            @RequestParam BigDecimal laborHours) {
        maintenanceOrderService.completeMaintenance(id, content, partsUsed, laborHours);
        return Result.success();
    }

    @PutMapping("/{id}/check")
    @RequireRole({RoleConstant.ADMIN, RoleConstant.DISPATCHER})
    @Log(operationModule = "维保工单", operationType = "修改", operationDesc = "工单验收")
    public Result<Void> check(
            @PathVariable Long id,
            @RequestParam Long checkerId,
            @RequestParam String checkOpinion,
            @RequestParam boolean passed) {
        maintenanceOrderService.checkOrder(id, checkerId, checkOpinion, passed);
        return Result.success();
    }

    @GetMapping("/{id}")
    @RequireRole(RoleConstant.ALL_ROLES)
    public Result<MaintenanceOrder> getById(@PathVariable Long id) {
        return Result.success(maintenanceOrderService.getById(id));
    }

    @GetMapping("/page")
    @RequireRole(RoleConstant.ALL_ROLES)
    public Result<Page<MaintenanceOrder>> page(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String miningArea,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long technicianId) {
        return Result.success(maintenanceOrderService.pageQuery(page, size, miningArea, status, technicianId));
    }

    @GetMapping("/{id}/logs")
    @RequireRole(RoleConstant.ALL_ROLES)
    public Result<List<MaintenanceOrderLog>> getLogs(@PathVariable Long id) {
        return Result.success(maintenanceOrderService.getOrderLogs(id));
    }
}