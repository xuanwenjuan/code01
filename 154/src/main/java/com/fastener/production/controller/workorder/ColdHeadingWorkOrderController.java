package com.fastener.production.controller.workorder;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.fastener.production.common.annotation.OperationLog;
import com.fastener.production.common.annotation.RequiresPermission;
import com.fastener.production.common.entity.PageQuery;
import com.fastener.production.common.enums.OperationTypeEnum;
import com.fastener.production.common.result.Result;
import com.fastener.production.entity.workorder.ColdHeadingWorkOrder;
import com.fastener.production.entity.workorder.WorkOrderProcess;
import com.fastener.production.entity.workorder.dto.ColdHeadingWorkOrderDTO;
import com.fastener.production.entity.workorder.dto.ProcessCompleteDTO;
import com.fastener.production.entity.workorder.dto.ProcessStartDTO;
import com.fastener.production.entity.workorder.dto.WorkOrderAuditDTO;
import com.fastener.production.service.workorder.ColdHeadingWorkOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@Tag(name = "冷镦加工工单管理", description = "冷镦加工工单创建、审核、工序流转管理接口")
@RestController
@RequestMapping("/workorder/cold-heading")
@RequiredArgsConstructor
public class ColdHeadingWorkOrderController {

    private final ColdHeadingWorkOrderService workOrderService;

    @Operation(summary = "分页查询工单列表")
    @GetMapping("/page")
    public Result<IPage<ColdHeadingWorkOrder>> page(PageQuery pageQuery,
                                                    @RequestParam(required = false) String orderNo,
                                                    @RequestParam(required = false) Long categoryId,
                                                    @RequestParam(required = false) Integer status,
                                                    @RequestParam(required = false) Integer auditStatus) {
        return Result.success(workOrderService.page(pageQuery, orderNo, categoryId, status, auditStatus));
    }

    @Operation(summary = "生成工单编号")
    @GetMapping("/generateNo")
    @RequiresPermission("process:compile")
    public Result<String> generateOrderNo() {
        return Result.success(workOrderService.generateOrderNo());
    }

    @Operation(summary = "获取工单详情")
    @GetMapping("/{id}")
    public Result<ColdHeadingWorkOrder> getById(@PathVariable Long id) {
        return Result.success(workOrderService.getById(id));
    }

    @Operation(summary = "获取工序列表")
    @GetMapping("/process/{workOrderId}")
    public Result<List<WorkOrderProcess>> getProcessList(@PathVariable Long workOrderId) {
        return Result.success(workOrderService.getProcessList(workOrderId));
    }

    @Operation(summary = "创建工单")
    @PostMapping
    @RequiresPermission("process:compile")
    public Result<Void> create(@Valid @RequestBody ColdHeadingWorkOrderDTO dto) {
        workOrderService.create(dto);
        return Result.success();
    }

    @Operation(summary = "工艺审核工单")
    @PostMapping("/audit")
    @RequiresPermission("process:audit")
    @OperationLog(moduleCode = "workorder", moduleName = "工单管理", operationType = OperationTypeEnum.PROCESS_AUDIT, description = "工艺审核工单")
    public Result<Void> audit(@Valid @RequestBody WorkOrderAuditDTO dto) {
        workOrderService.audit(dto);
        return Result.success();
    }

    @Operation(summary = "手动预占原料")
    @PostMapping("/reserve")
    @RequiresPermission("production:manage")
    @OperationLog(moduleCode = "material", moduleName = "原料管理", operationType = OperationTypeEnum.MATERIAL_RESERVE, description = "手动预占原料")
    public Result<Void> reserveMaterial(@RequestParam Long workOrderId,
                                        @RequestParam Long batchId,
                                        @RequestParam BigDecimal quantity) {
        workOrderService.reserveMaterial(workOrderId, batchId, quantity);
        return Result.success();
    }

    @Operation(summary = "自动预占原料（按先进先出）")
    @PostMapping("/auto-reserve/{workOrderId}")
    @RequiresPermission("production:manage")
    @OperationLog(moduleCode = "material", moduleName = "原料管理", operationType = OperationTypeEnum.MATERIAL_RESERVE, description = "自动预占原料")
    public Result<Void> autoReserveMaterial(@PathVariable Long workOrderId) {
        workOrderService.autoReserveMaterial(workOrderId);
        return Result.success();
    }

    @Operation(summary = "释放预占原料")
    @PostMapping("/release-reserve/{workOrderId}")
    @RequiresPermission("production:manage")
    @OperationLog(moduleCode = "material", moduleName = "原料管理", operationType = OperationTypeEnum.RESERVE_RELEASE, description = "释放预占原料")
    public Result<Void> releaseMaterial(@PathVariable Long workOrderId) {
        workOrderService.releaseMaterial(workOrderId);
        return Result.success();
    }

    @Operation(summary = "启动工单")
    @PutMapping("/start/{id}")
    @RequiresPermission("workorder:start")
    @OperationLog(moduleCode = "workorder", moduleName = "工单管理", operationType = OperationTypeEnum.WORK_ORDER_START, description = "启动工单")
    public Result<Void> startWorkOrder(@PathVariable Long id) {
        workOrderService.startWorkOrder(id);
        return Result.success();
    }

    @Operation(summary = "开始工序")
    @PostMapping("/process/start")
    @RequiresPermission("production:manage")
    public Result<Void> startProcess(@Valid @RequestBody ProcessStartDTO dto) {
        workOrderService.startProcess(dto);
        return Result.success();
    }

    @Operation(summary = "完成工序")
    @PostMapping("/process/complete")
    @RequiresPermission("production:manage")
    public Result<Void> completeProcess(@Valid @RequestBody ProcessCompleteDTO dto) {
        workOrderService.completeProcess(dto);
        return Result.success();
    }

    @Operation(summary = "冻结工单")
    @PutMapping("/freeze/{id}")
    @RequiresPermission("process:compile")
    public Result<Void> freezeWorkOrder(@PathVariable Long id) {
        workOrderService.freezeWorkOrder(id);
        return Result.success();
    }

    @Operation(summary = "取消工单")
    @PutMapping("/cancel/{id}")
    @RequiresPermission("process:compile")
    public Result<Void> cancelWorkOrder(@PathVariable Long id) {
        workOrderService.cancelWorkOrder(id);
        return Result.success();
    }
}
