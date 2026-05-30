package com.cosmetics.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cosmetics.annotation.RequireRole;
import com.cosmetics.common.PageQuery;
import com.cosmetics.common.Result;
import com.cosmetics.dto.ProcessRecordDTO;
import com.cosmetics.dto.WorkOrderCreateDTO;
import com.cosmetics.dto.WorkOrderMaterialDTO;
import com.cosmetics.entity.QualityInspection;
import com.cosmetics.entity.WorkOrder;
import com.cosmetics.entity.WorkOrderMaterial;
import com.cosmetics.entity.WorkProcess;
import com.cosmetics.enums.UserRoleEnum;
import com.cosmetics.service.WorkOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Tag(name = "生产工单管理")
@RestController
@RequestMapping("/work-orders")
@RequiredArgsConstructor
public class WorkOrderController {

    private final WorkOrderService workOrderService;

    @Operation(summary = "分页查询工单列表")
    @GetMapping("/page")
    public Result<Page<WorkOrder>> getPage(
            @ModelAttribute PageQuery pageQuery,
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) Integer priority) {
        return Result.success(workOrderService.getPage(pageQuery, productId, status, priority));
    }

    @Operation(summary = "获取工单详情")
    @GetMapping("/{id}")
    public Result<WorkOrder> getById(@PathVariable Long id) {
        return Result.success(workOrderService.getById(id));
    }

    @Operation(summary = "获取工单进度详情")
    @GetMapping("/{id}/progress")
    public Result<Map<String, Object>> getWorkOrderProgress(@PathVariable Long id) {
        return Result.success(workOrderService.getWorkOrderProgress(id));
    }

    @Operation(summary = "获取工单统计")
    @GetMapping("/statistics")
    @RequireRole({UserRoleEnum.PRODUCTION_LEADER, UserRoleEnum.QUALITY_INSPECTOR, UserRoleEnum.WAREHOUSE_ADMIN})
    public Result<Map<String, Object>> getStatistics() {
        return Result.success(workOrderService.getStatistics());
    }

    @Operation(summary = "生成工单号")
    @GetMapping("/generate-order-no")
    @RequireRole({UserRoleEnum.PRODUCTION_LEADER})
    public Result<String> generateOrderNo() {
        return Result.success(workOrderService.generateOrderNo());
    }

    @Operation(summary = "创建工单")
    @PostMapping
    @RequireRole({UserRoleEnum.PRODUCTION_LEADER})
    public Result<Void> create(@Valid @RequestBody WorkOrderCreateDTO createDTO) {
        workOrderService.create(createDTO);
        return Result.success();
    }

    @Operation(summary = "确认配方并锁定原料库存")
    @PutMapping("/{id}/confirm-formula")
    @RequireRole({UserRoleEnum.PRODUCTION_LEADER, UserRoleEnum.FORMULA_DEVELOPER})
    public Result<Void> confirmFormula(@PathVariable Long id) {
        workOrderService.confirmFormula(id);
        return Result.success();
    }

    @Operation(summary = "解锁原料库存")
    @PutMapping("/{id}/unlock-stock")
    @RequireRole({UserRoleEnum.PRODUCTION_LEADER})
    public Result<Void> unlockStock(@PathVariable Long id) {
        workOrderService.unlockStock(id);
        return Result.success();
    }

    @Operation(summary = "开始生产")
    @PutMapping("/{id}/start")
    @RequireRole({UserRoleEnum.PRODUCTION_LEADER})
    public Result<Void> startProduction(@PathVariable Long id) {
        workOrderService.startProduction(id);
        return Result.success();
    }

    @Operation(summary = "进入下一工序")
    @PutMapping("/{id}/next-process")
    @RequireRole({UserRoleEnum.PRODUCTION_LEADER})
    public Result<Void> processNext(
            @PathVariable Long id,
            @RequestBody(required = false) ProcessRecordDTO processDTO) {
        workOrderService.processNext(id, processDTO);
        return Result.success();
    }

    @Operation(summary = "生产领料")
    @PostMapping("/{id}/pick-material")
    @RequireRole({UserRoleEnum.PRODUCTION_LEADER, UserRoleEnum.WAREHOUSE_ADMIN})
    public Result<Void> pickMaterial(
            @PathVariable Long id,
            @RequestParam Long materialBatchId,
            @RequestParam BigDecimal quantity) {
        workOrderService.pickMaterial(id, materialBatchId, quantity);
        return Result.success();
    }

    @Operation(summary = "批量生产领料")
    @PostMapping("/{id}/batch-pick-material")
    @RequireRole({UserRoleEnum.PRODUCTION_LEADER, UserRoleEnum.WAREHOUSE_ADMIN})
    public Result<Void> batchPickMaterial(
            @PathVariable Long id,
            @RequestBody List<Map<String, Object>> pickList) {
        workOrderService.batchPickMaterial(id, pickList);
        return Result.success();
    }

    @Operation(summary = "获取工单用料列表")
    @GetMapping("/{id}/materials")
    public Result<List<WorkOrderMaterial>> getWorkOrderMaterials(@PathVariable Long id) {
        return Result.success(workOrderService.getWorkOrderMaterials(id));
    }

    @Operation(summary = "添加工单用料")
    @PostMapping("/{id}/materials")
    @RequireRole({UserRoleEnum.PRODUCTION_LEADER})
    public Result<Void> addWorkOrderMaterial(
            @PathVariable Long id,
            @Valid @RequestBody WorkOrderMaterialDTO materialDTO) {
        workOrderService.addWorkOrderMaterial(id, materialDTO);
        return Result.success();
    }

    @Operation(summary = "删除工单用料")
    @DeleteMapping("/materials/{id}")
    @RequireRole({UserRoleEnum.PRODUCTION_LEADER})
    public Result<Void> removeWorkOrderMaterial(@PathVariable Long id) {
        workOrderService.removeWorkOrderMaterial(id);
        return Result.success();
    }

    @Operation(summary = "获取工单一览表序记录")
    @GetMapping("/{id}/processes")
    public Result<List<WorkProcess>> getWorkProcesses(@PathVariable Long id) {
        return Result.success(workOrderService.getWorkProcesses(id));
    }

    @Operation(summary = "暂停工单")
    @PutMapping("/{id}/suspend")
    @RequireRole({UserRoleEnum.PRODUCTION_LEADER})
    public Result<Void> suspend(@PathVariable Long id, @RequestParam(required = false) String reason) {
        workOrderService.suspend(id, reason);
        return Result.success();
    }

    @Operation(summary = "恢复工单")
    @PutMapping("/{id}/resume")
    @RequireRole({UserRoleEnum.PRODUCTION_LEADER})
    public Result<Void> resume(@PathVariable Long id) {
        workOrderService.resume(id);
        return Result.success();
    }

    @Operation(summary = "取消工单")
    @PutMapping("/{id}/cancel")
    @RequireRole({UserRoleEnum.PRODUCTION_LEADER})
    public Result<Void> cancel(@PathVariable Long id, @RequestParam(required = false) String reason) {
        workOrderService.cancel(id, reason);
        return Result.success();
    }

    @Operation(summary = "质检")
    @PutMapping("/{id}/quality-check")
    @RequireRole({UserRoleEnum.QUALITY_INSPECTOR})
    public Result<Void> qualityCheck(
            @PathVariable Long id,
            @RequestBody QualityInspection inspection) {
        workOrderService.qualityCheck(id, inspection);
        return Result.success();
    }

    @Operation(summary = "成品入库完成")
    @PutMapping("/{id}/warehouse")
    @RequireRole({UserRoleEnum.WAREHOUSE_ADMIN})
    public Result<Void> finishWarehousing(
            @PathVariable Long id,
            @RequestParam BigDecimal actualQuantity,
            @RequestParam(required = false) Long operatorId) {
        workOrderService.finishWarehousing(id, actualQuantity, operatorId);
        return Result.success();
    }
}
