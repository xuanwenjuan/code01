package com.liquor.brewing.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.liquor.brewing.annotation.Log;
import com.liquor.brewing.annotation.RequiresRole;
import com.liquor.brewing.common.Constants;
import com.liquor.brewing.common.PageQuery;
import com.liquor.brewing.common.PageResult;
import com.liquor.brewing.common.Result;
import com.liquor.brewing.dto.WorkOrderMaterialPickDTO;
import com.liquor.brewing.dto.WorkOrderQueryDTO;
import com.liquor.brewing.entity.WorkOrder;
import com.liquor.brewing.entity.WorkOrderMaterial;
import com.liquor.brewing.entity.WorkOrderProcess;
import com.liquor.brewing.service.WorkOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@Tag(name = "生产工单管理", description = "酿造灌装生产工单管理接口")
@RestController
@RequestMapping("/work-order")
public class WorkOrderController {

    @Resource
    private WorkOrderService workOrderService;

    @Operation(summary = "分页查询工单列表")
    @GetMapping("/page")
    public Result<PageResult<WorkOrder>> page(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Integer status,
            PageQuery pageQuery) {
        IPage<WorkOrder> page = workOrderService.page(keyword, categoryId, status, pageQuery);
        return Result.success(PageResult.of(page));
    }

    @Operation(summary = "多条件查询工单列表")
    @PostMapping("/query")
    public Result<PageResult<WorkOrder>> query(@RequestBody WorkOrderQueryDTO query, PageQuery pageQuery) {
        IPage<WorkOrder> page = workOrderService.pageByCondition(query, pageQuery);
        return Result.success(PageResult.of(page));
    }

    @Operation(summary = "创建工单")
    @PostMapping
    @RequiresRole(value = {Constants.RoleCode.BREWER, Constants.RoleCode.SUPERVISOR}, message = "只有酿造技术员或车间主管可以创建工单")
    @Log(module = "生产工单", operationType = Constants.OperationType.CREATE, description = "创建生产工单")
    public Result<Void> create(@RequestBody WorkOrder workOrder) {
        workOrderService.create(workOrder);
        return Result.success();
    }

    @Operation(summary = "开始工单（启动第一道工序）")
    @PutMapping("/{id}/start")
    @RequiresRole(value = {Constants.RoleCode.BREWER, Constants.RoleCode.SUPERVISOR}, message = "只有酿造技术员或车间主管可以开始工单")
    @Log(module = "生产工单", operationType = Constants.OperationType.STATUS_CHANGE, description = "开始生产工单")
    public Result<Void> start(@PathVariable Long id) {
        workOrderService.start(id);
        return Result.success();
    }

    @Operation(summary = "获取工单详情")
    @GetMapping("/{id}")
    public Result<WorkOrder> detail(@PathVariable Long id) {
        return Result.success(workOrderService.detail(id));
    }

    @Operation(summary = "开始工序")
    @PutMapping("/{id}/process/{processType}/start")
    @RequiresRole(value = {Constants.RoleCode.BREWER, Constants.RoleCode.SUPERVISOR}, message = "只有酿造技术员或车间主管可以开始工序")
    @Log(module = "生产工单", operationType = Constants.OperationType.STATUS_CHANGE, description = "开始工单工序")
    public Result<Void> startProcess(@PathVariable Long id, @PathVariable Integer processType) {
        workOrderService.startProcess(id, processType);
        return Result.success();
    }

    @Operation(summary = "完成工序")
    @PutMapping("/{id}/process/{processType}/finish")
    @RequiresRole(value = {Constants.RoleCode.BREWER, Constants.RoleCode.INSPECTOR, Constants.RoleCode.SUPERVISOR}, message = "只有酿造技术员、成品巡检员或车间主管可以完成工序")
    @Log(module = "生产工单", operationType = Constants.OperationType.STATUS_CHANGE, description = "完成工单工序")
    public Result<Void> finishProcess(
            @PathVariable Long id,
            @PathVariable Integer processType,
            @RequestBody WorkOrderProcess process) {
        workOrderService.finishProcess(id, processType, process);
        return Result.success();
    }

    @Operation(summary = "完成工单")
    @PutMapping("/{id}/finish")
    @RequiresRole(value = {Constants.RoleCode.INSPECTOR, Constants.RoleCode.SUPERVISOR}, message = "只有成品巡检员或车间主管可以完成工单")
    @Log(module = "生产工单", operationType = Constants.OperationType.STATUS_CHANGE, description = "完成生产工单")
    public Result<Void> finish(@PathVariable Long id) {
        workOrderService.finish(id);
        return Result.success();
    }

    @Operation(summary = "冻结工单")
    @PutMapping("/{id}/freeze")
    @RequiresRole(value = {Constants.RoleCode.SUPERVISOR}, message = "只有车间主管可以冻结工单")
    @Log(module = "生产工单", operationType = Constants.OperationType.STATUS_CHANGE, description = "冻结生产工单")
    public Result<Void> freeze(@PathVariable Long id) {
        workOrderService.freeze(id);
        return Result.success();
    }

    @Operation(summary = "解冻工单")
    @PutMapping("/{id}/unfreeze")
    @RequiresRole(value = {Constants.RoleCode.SUPERVISOR}, message = "只有车间主管可以解冻工单")
    @Log(module = "生产工单", operationType = Constants.OperationType.STATUS_CHANGE, description = "解冻生产工单")
    public Result<Void> unfreeze(@PathVariable Long id) {
        workOrderService.unfreeze(id);
        return Result.success();
    }

    @Operation(summary = "取消工单")
    @PutMapping("/{id}/cancel")
    @RequiresRole(value = {Constants.RoleCode.SUPERVISOR}, message = "只有车间主管可以取消工单")
    @Log(module = "生产工单", operationType = Constants.OperationType.STATUS_CHANGE, description = "取消生产工单")
    public Result<Void> cancel(@PathVariable Long id) {
        workOrderService.cancel(id);
        return Result.success();
    }

    @Operation(summary = "工单领料出库")
    @PostMapping("/material/pick")
    @RequiresRole(value = {Constants.RoleCode.BREWER, Constants.RoleCode.SUPERVISOR}, message = "只有酿造技术员或车间主管可以领料")
    @Log(module = "生产工单", operationType = Constants.OperationType.STATUS_CHANGE, description = "工单领料出库")
    public Result<Void> pickMaterial(@Valid @RequestBody WorkOrderMaterialPickDTO dto) {
        workOrderService.pickMaterial(dto);
        return Result.success();
    }

    @Operation(summary = "工单退料入库")
    @PostMapping("/material/return")
    @RequiresRole(value = {Constants.RoleCode.BREWER, Constants.RoleCode.SUPERVISOR}, message = "只有酿造技术员或车间主管可以退料")
    @Log(module = "生产工单", operationType = Constants.OperationType.STATUS_CHANGE, description = "工单退料入库")
    public Result<Void> returnMaterial(@Valid @RequestBody WorkOrderMaterialPickDTO dto) {
        workOrderService.returnMaterial(dto);
        return Result.success();
    }

    @Operation(summary = "获取工单用料列表")
    @GetMapping("/{workOrderId}/materials")
    public Result<List<WorkOrderMaterial>> getOrderMaterials(@PathVariable Long workOrderId) {
        return Result.success(workOrderService.getOrderMaterials(workOrderId));
    }

    @Operation(summary = "更新工单实际用料量")
    @PutMapping("/{workOrderId}/material/{materialId}/actual-quantity")
    public Result<Void> updateActualQuantity(
            @PathVariable Long workOrderId,
            @PathVariable Long materialId,
            @RequestParam BigDecimal actualQuantity) {
        workOrderService.updateActualQuantity(workOrderId, materialId, actualQuantity);
        return Result.success();
    }
}
