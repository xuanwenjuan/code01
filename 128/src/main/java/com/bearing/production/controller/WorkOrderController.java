package com.bearing.production.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.bearing.production.annotation.OperationLog;
import com.bearing.production.annotation.RequiresRole;
import com.bearing.production.common.Result;
import com.bearing.production.dto.CostCalculationDTO;
import com.bearing.production.dto.WorkOrderDTO;
import com.bearing.production.dto.WorkOrderStartDTO;
import com.bearing.production.entity.ProductionWaste;
import com.bearing.production.entity.WorkOrder;
import com.bearing.production.enums.RoleEnum;
import com.bearing.production.service.WorkOrderService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/work-order")
@RequiredArgsConstructor
public class WorkOrderController {

    private final WorkOrderService workOrderService;

    @PostMapping
    @RequiresRole({RoleEnum.ADMIN_CODE, RoleEnum.PROCESS_ENGINEER_CODE})
    @OperationLog(module = "冷锻成型生产工单", description = "创建生产工单")
    public Result<Void> createWorkOrder(@Valid @RequestBody WorkOrderDTO workOrderDTO) {
        workOrderService.createWorkOrder(workOrderDTO);
        return Result.success("创建成功", null);
    }

    @PostMapping("/start")
    @RequiresRole({RoleEnum.ADMIN_CODE, RoleEnum.LINE_LEADER_CODE})
    @OperationLog(module = "冷锻成型生产工单", description = "工单投产，锁定原料库存")
    public Result<Void> startWorkOrder(@Valid @RequestBody WorkOrderStartDTO startDTO) {
        workOrderService.startWorkOrder(startDTO);
        return Result.success("投产成功", null);
    }

    @PutMapping("/{id}/process")
    @RequiresRole({RoleEnum.ADMIN_CODE, RoleEnum.LINE_LEADER_CODE})
    @OperationLog(module = "冷锻成型生产工单", description = "工单状态流转")
    public Result<Void> processStatus(
            @PathVariable @NotNull Long id,
            @RequestParam @NotNull Integer targetStatus,
            @RequestParam(required = false) BigDecimal materialUsage,
            @RequestParam(required = false) BigDecimal equipmentLoss,
            @RequestParam(required = false) BigDecimal energyCost,
            @RequestParam(required = false) BigDecimal laborHours,
            @RequestParam(required = false) BigDecimal defectiveQuantity,
            @RequestParam(required = false) BigDecimal defectiveLoss) {
        workOrderService.processStatus(id, targetStatus, materialUsage, equipmentLoss,
                energyCost, laborHours, defectiveQuantity, defectiveLoss);
        return Result.success("状态流转成功", null);
    }

    @PutMapping("/{id}/next")
    @RequiresRole({RoleEnum.ADMIN_CODE, RoleEnum.LINE_LEADER_CODE})
    @OperationLog(module = "冷锻成型生产工单", description = "自动流转到下一状态")
    public Result<Void> nextStatus(@PathVariable @NotNull Long id) {
        workOrderService.nextStatus(id);
        return Result.success("状态自动流转成功", null);
    }

    @PostMapping("/complete")
    @RequiresRole({RoleEnum.ADMIN_CODE, RoleEnum.QUALITY_INSPECTOR_CODE})
    @OperationLog(module = "冷锻成型生产工单", description = "成品完工，归集生产损耗核算成本")
    public Result<ProductionWaste> completeWorkOrder(@Valid @RequestBody CostCalculationDTO costDTO) {
        ProductionWaste waste = workOrderService.completeWorkOrder(costDTO);
        return Result.success("完工核算完成", waste);
    }

    @PutMapping("/{id}/defective")
    @RequiresRole({RoleEnum.ADMIN_CODE, RoleEnum.QUALITY_INSPECTOR_CODE})
    @OperationLog(module = "冷锻成型生产工单", description = "更新次品数据")
    public Result<Void> updateDefectiveData(
            @PathVariable @NotNull Long id,
            @RequestParam(required = false) BigDecimal defectiveQuantity,
            @RequestParam(required = false) BigDecimal defectiveLoss,
            @RequestParam(required = false) String qualityInspector) {
        workOrderService.updateDefectiveData(id, defectiveQuantity, defectiveLoss, qualityInspector);
        return Result.success("次品数据更新成功", null);
    }

    @PutMapping("/{id}/suspend")
    @RequiresRole({RoleEnum.ADMIN_CODE, RoleEnum.PROCESS_ENGINEER_CODE})
    @OperationLog(module = "冷锻成型生产工单", description = "暂停工单")
    public Result<Void> suspendWorkOrder(
            @PathVariable @NotNull Long id,
            @RequestParam(defaultValue = "生产调整") String reason) {
        workOrderService.suspendWorkOrder(id, reason);
        return Result.success("暂停成功", null);
    }

    @PutMapping("/{id}/resume")
    @RequiresRole({RoleEnum.ADMIN_CODE, RoleEnum.PROCESS_ENGINEER_CODE})
    @OperationLog(module = "冷锻成型生产工单", description = "恢复工单")
    public Result<Void> resumeWorkOrder(@PathVariable @NotNull Long id) {
        workOrderService.resumeWorkOrder(id);
        return Result.success("恢复成功", null);
    }

    @PutMapping("/{id}/cancel")
    @RequiresRole({RoleEnum.ADMIN_CODE, RoleEnum.PROCESS_ENGINEER_CODE})
    @OperationLog(module = "冷锻成型生产工单", description = "取消工单")
    public Result<Void> cancelWorkOrder(
            @PathVariable @NotNull Long id,
            @RequestParam(defaultValue = "计划变更") String reason) {
        workOrderService.cancelWorkOrder(id, reason);
        return Result.success("取消成功", null);
    }

    @GetMapping("/{id}")
    @RequiresRole({RoleEnum.ADMIN_CODE, RoleEnum.PROCESS_ENGINEER_CODE, RoleEnum.LINE_LEADER_CODE, RoleEnum.QUALITY_INSPECTOR_CODE})
    public Result<WorkOrder> getById(@PathVariable @NotNull Long id) {
        WorkOrder workOrder = workOrderService.getById(id);
        return Result.success("查询成功", workOrder);
    }

    @GetMapping("/list")
    @RequiresRole({RoleEnum.ADMIN_CODE, RoleEnum.PROCESS_ENGINEER_CODE, RoleEnum.LINE_LEADER_CODE, RoleEnum.QUALITY_INSPECTOR_CODE})
    public Result<List<WorkOrder>> getByStatus(@RequestParam(required = false) Integer status) {
        List<WorkOrder> list = workOrderService.getByStatus(status);
        return Result.success("查询成功", list);
    }

    @GetMapping("/page")
    @RequiresRole({RoleEnum.ADMIN_CODE, RoleEnum.PROCESS_ENGINEER_CODE, RoleEnum.LINE_LEADER_CODE, RoleEnum.QUALITY_INSPECTOR_CODE})
    public Result<IPage<WorkOrder>> getByStatusPage(
            @RequestParam(required = false) Integer status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        IPage<WorkOrder> pageResult = workOrderService.getByStatusPage(status, page, size);
        return Result.success("查询成功", pageResult);
    }

    @GetMapping("/status-names")
    @RequiresRole({RoleEnum.ADMIN_CODE, RoleEnum.PROCESS_ENGINEER_CODE, RoleEnum.LINE_LEADER_CODE, RoleEnum.QUALITY_INSPECTOR_CODE})
    public Result<List<String>> getStatusNames() {
        List<String> statusNames = List.of(
                "已创建", "待投产", "圆钢切断下料", "中频预热处理",
                "闭式冷锻成型", "精整修边", "热处理调质", "精密研磨分选",
                "成品入库", "已暂停", "已取消");
        return Result.success("查询成功", statusNames);
    }
}
