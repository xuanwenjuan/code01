package com.bee.equipment.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.bee.equipment.annotation.OperationLog;
import com.bee.equipment.annotation.Permission;
import com.bee.equipment.annotation.RequireRole;
import com.bee.equipment.common.PermissionEnum;
import com.bee.equipment.common.Result;
import com.bee.equipment.common.RoleEnum;
import com.bee.equipment.dto.WorkOrderDTO;
import com.bee.equipment.dto.WorkOrderFinishDTO;
import com.bee.equipment.service.WorkOrderService;
import com.bee.equipment.vo.WorkOrderVO;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/work-order")
public class WorkOrderController {

    @Autowired
    private WorkOrderService workOrderService;

    @GetMapping("/page")
    @RequireRole({RoleEnum.ADMIN, RoleEnum.ASSEMBLER, RoleEnum.OPERATOR})
    @Permission(PermissionEnum.WORKORDER_VIEW)
    public Result<Page<WorkOrderVO>> listWithPage(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String status) {
        return Result.success(workOrderService.listWithPage(pageNum, pageSize, status));
    }

    @GetMapping("/{id}")
    @RequireRole({RoleEnum.ADMIN, RoleEnum.ASSEMBLER, RoleEnum.OPERATOR})
    @Permission(PermissionEnum.WORKORDER_VIEW)
    public Result<WorkOrderVO> getDetail(@PathVariable Long id) {
        return Result.success(workOrderService.getDetail(id));
    }

    @PostMapping
    @RequireRole(RoleEnum.ADMIN)
    @Permission(PermissionEnum.WORKORDER_CREATE)
    @OperationLog(module = "工单管理", description = "创建工单")
    public Result<Void> createWorkOrder(@Valid @RequestBody WorkOrderDTO workOrderDTO) {
        workOrderService.createWorkOrder(workOrderDTO);
        return Result.success();
    }

    @PutMapping("/{id}/pick")
    @RequireRole(RoleEnum.ASSEMBLER)
    @Permission(PermissionEnum.WORKORDER_PICK)
    @OperationLog(module = "工单管理", description = "物料领料")
    public Result<Void> pickMaterial(@PathVariable Long id, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        workOrderService.pickMaterial(id, userId);
        return Result.success();
    }

    @PutMapping("/{id}/start-assembly")
    @RequireRole(RoleEnum.ASSEMBLER)
    @Permission(PermissionEnum.WORKORDER_ASSEMBLE)
    @OperationLog(module = "工单管理", description = "开始组装")
    public Result<Void> startAssembly(@PathVariable Long id) {
        workOrderService.startAssembly(id);
        return Result.success();
    }

    @PostMapping("/finish-assembly")
    @RequireRole(RoleEnum.ASSEMBLER)
    @Permission(PermissionEnum.WORKORDER_ASSEMBLE)
    @OperationLog(module = "工单管理", description = "完成组装")
    public Result<Map<String, Object>> finishAssembly(@Valid @RequestBody WorkOrderFinishDTO finishDTO) {
        return Result.success(workOrderService.finishAssembly(finishDTO));
    }

    @PutMapping("/{id}/start-inspection")
    @RequireRole(RoleEnum.ADMIN)
    @Permission(PermissionEnum.WORKORDER_INSPECT)
    @OperationLog(module = "工单管理", description = "开始质检")
    public Result<Void> startInspection(@PathVariable Long id) {
        workOrderService.startInspection(id);
        return Result.success();
    }

    @PutMapping("/{id}/deliver")
    @RequireRole(RoleEnum.OPERATOR)
    @Permission(PermissionEnum.WORKORDER_DELIVER)
    @OperationLog(module = "工单管理", description = "配发蜂场")
    public Result<Void> deliver(@PathVariable Long id) {
        workOrderService.deliver(id);
        return Result.success();
    }

    @PutMapping("/{id}/resume")
    @RequireRole(RoleEnum.ADMIN)
    @Permission(PermissionEnum.WORKORDER_CREATE)
    @OperationLog(module = "工单管理", description = "恢复工单")
    public Result<Void> resumeWorkOrder(@PathVariable Long id) {
        workOrderService.resumeWorkOrder(id);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @RequireRole(RoleEnum.ADMIN)
    @Permission(PermissionEnum.WORKORDER_CANCEL)
    @OperationLog(module = "工单管理", description = "取消工单")
    public Result<Void> cancelWorkOrder(@PathVariable Long id) {
        workOrderService.cancelWorkOrder(id);
        return Result.success();
    }
}
