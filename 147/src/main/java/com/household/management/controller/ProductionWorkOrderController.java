package com.household.management.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.household.management.common.annotation.OperationLog;
import com.household.management.common.entity.PageQuery;
import com.household.management.common.result.Result;
import com.household.management.entity.ProductionWorkOrder;
import com.household.management.entity.WorkOrderMaterial;
import com.household.management.entity.WorkOrderProcess;
import com.household.management.service.ProductionWorkOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Tag(name = "生产工单管理")
@RestController
@RequestMapping("/production/work-order")
public class ProductionWorkOrderController {

    private final ProductionWorkOrderService workOrderService;

    public ProductionWorkOrderController(ProductionWorkOrderService workOrderService) {
        this.workOrderService = workOrderService;
    }

    @GetMapping("/list")
    @Operation(summary = "获取工单列表")
    public Result<List<ProductionWorkOrder>> list() {
        return Result.success(workOrderService.list());
    }

    @GetMapping("/page")
    @Operation(summary = "分页查询工单列表")
    public Result<IPage<ProductionWorkOrder>> page(PageQuery pageQuery,
                                                    @RequestParam(required = false) Integer status,
                                                    @RequestParam(required = false) Long productId) {
        return Result.success(workOrderService.page(pageQuery, status, productId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "获取工单详情")
    public Result<ProductionWorkOrder> getById(@PathVariable Long id) {
        return Result.success(workOrderService.getById(id));
    }

    @GetMapping("/{id}/materials")
    @Operation(summary = "获取工单用料明细")
    public Result<List<WorkOrderMaterial>> getMaterials(@PathVariable Long id) {
        return Result.success(workOrderService.getWorkOrderMaterials(id));
    }

    @GetMapping("/{id}/processes")
    @Operation(summary = "获取工单工序记录")
    public Result<List<WorkOrderProcess>> getProcesses(@PathVariable Long id) {
        return Result.success(workOrderService.getWorkOrderProcesses(id));
    }

    @GetMapping("/process-map")
    @Operation(summary = "获取工序字典")
    public Result<Map<String, String>> getProcessMap() {
        return Result.success(workOrderService.getProcessMap());
    }

    @PostMapping
    @Operation(summary = "创建生产工单")
    @OperationLog(module = "生产工单管理", operation = "创建工单")
    public Result<Void> add(@Valid @RequestBody ProductionWorkOrder workOrder) {
        workOrderService.add(workOrder);
        return Result.success();
    }

    @PostMapping("/{id}/materials")
    @Operation(summary = "设置工单用料明细")
    @OperationLog(module = "生产工单管理", operation = "设置工单用料")
    public Result<Void> setMaterials(@PathVariable Long id, @RequestBody List<WorkOrderMaterial> materials) {
        workOrderService.addWorkOrderMaterial(id, materials);
        return Result.success();
    }

    @PutMapping("/{id}/pick-material")
    @Operation(summary = "工单领料")
    @OperationLog(module = "生产工单管理", operation = "工单领料")
    public Result<Void> pickMaterial(@PathVariable Long id,
                                     @RequestParam Long materialId,
                                     @RequestParam BigDecimal quantity,
                                     @RequestParam String batchNo) {
        workOrderService.pickMaterial(id, materialId, quantity, batchNo);
        return Result.success();
    }

    @PutMapping
    @Operation(summary = "更新生产工单")
    @OperationLog(module = "生产工单管理", operation = "更新工单")
    public Result<Void> update(@Valid @RequestBody ProductionWorkOrder workOrder) {
        workOrderService.update(workOrder);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除生产工单")
    @OperationLog(module = "生产工单管理", operation = "删除工单")
    public Result<Void> delete(@PathVariable Long id) {
        workOrderService.delete(id);
        return Result.success();
    }

    @PutMapping("/{id}/confirm-plan")
    @Operation(summary = "确定量产方案并锁定原材料库存")
    @OperationLog(module = "生产工单管理", operation = "确定量产方案")
    public Result<Void> confirmProductionPlan(@PathVariable Long id) {
        workOrderService.confirmProductionPlan(id);
        return Result.success();
    }

    @PutMapping("/{id}/start")
    @Operation(summary = "开始生产")
    @OperationLog(module = "生产工单管理", operation = "开始生产")
    public Result<Void> startProduction(@PathVariable Long id) {
        workOrderService.startProduction(id);
        return Result.success();
    }

    @PutMapping("/{id}/complete-process")
    @Operation(summary = "完成当前工序")
    @OperationLog(module = "生产工单管理", operation = "完成工序")
    public Result<Void> completeProcess(@PathVariable Long id,
                                        @RequestParam Integer qualifiedQuantity,
                                        @RequestParam Integer defectiveQuantity,
                                        @RequestParam(required = false) String remark,
                                        HttpServletRequest request) {
        Long operatorId = (Long) request.getAttribute("currentUserId");
        workOrderService.completeProcess(id, operatorId, qualifiedQuantity, defectiveQuantity, remark);
        return Result.success();
    }

    @PutMapping("/{id}/pause")
    @Operation(summary = "暂停生产")
    @OperationLog(module = "生产工单管理", operation = "暂停生产")
    public Result<Void> pauseProduction(@PathVariable Long id, @RequestParam(required = false) String reason) {
        workOrderService.pauseProduction(id, reason);
        return Result.success();
    }

    @PutMapping("/{id}/cancel")
    @Operation(summary = "取消工单")
    @OperationLog(module = "生产工单管理", operation = "取消工单")
    public Result<Void> cancelWorkOrder(@PathVariable Long id, @RequestParam(required = false) String reason) {
        workOrderService.cancelWorkOrder(id, reason);
        return Result.success();
    }
}
