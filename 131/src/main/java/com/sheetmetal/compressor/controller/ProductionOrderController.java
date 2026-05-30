package com.sheetmetal.compressor.controller;

import com.sheetmetal.compressor.annotation.OperationLog;
import com.sheetmetal.compressor.annotation.RequiresRole;
import com.sheetmetal.compressor.common.PageQuery;
import com.sheetmetal.compressor.common.PageResult;
import com.sheetmetal.compressor.context.UserContext;
import com.sheetmetal.compressor.dto.*;
import com.sheetmetal.compressor.entity.MaterialLock;
import com.sheetmetal.compressor.entity.ProductionLoss;
import com.sheetmetal.compressor.entity.ProductionOrder;
import com.sheetmetal.compressor.enums.UserRole;
import com.sheetmetal.compressor.service.*;
import com.sheetmetal.compressor.common.Result;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/order")
public class ProductionOrderController {

    @Autowired
    private ProductionOrderService orderService;

    @Autowired
    private MaterialLockService materialLockService;

    @Autowired
    private ProductionLossService productionLossService;

    @GetMapping("/page")
    public Result<PageResult<ProductionOrder>> queryPage(
            @Valid PageQuery query,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) Long categoryId
    ) {
        return Result.success(orderService.queryPage(query, status, categoryId));
    }

    @GetMapping("/{id}")
    public Result<ProductionOrder> getById(@PathVariable Long id) {
        return Result.success(orderService.getById(id));
    }

    @PostMapping
    @RequiresRole({UserRole.ADMIN, UserRole.PROCESS_ENGINEER})
    @OperationLog(module = "工单管理", type = "创建", desc = "创建生产工单")
    public Result<Void> create(@Valid @RequestBody ProductionOrderDTO dto) {
        orderService.create(dto);
        return Result.success();
    }

    @PutMapping("/schedule")
    @RequiresRole({UserRole.ADMIN, UserRole.PROCESS_ENGINEER})
    @OperationLog(module = "工单管理", type = "排产", desc = "工单排产安排")
    public Result<Void> schedule(@Valid @RequestBody OrderScheduleDTO dto) {
        orderService.schedule(dto);
        return Result.success();
    }

    @PutMapping("/lock-material")
    @RequiresRole({UserRole.ADMIN, UserRole.PROCESS_ENGINEER})
    @OperationLog(module = "工单管理", type = "锁定原料", desc = "确认工艺并锁定原料")
    public Result<Void> lockMaterial(@Valid @RequestBody MaterialLockDTO dto) {
        materialLockService.lockMaterial(dto);
        return Result.success();
    }

    @PutMapping("/{id}/unlock-material")
    @RequiresRole({UserRole.ADMIN, UserRole.PROCESS_ENGINEER})
    @OperationLog(module = "工单管理", type = "解锁原料", desc = "解锁原料库存")
    public Result<Void> unlockMaterial(@PathVariable Long id, @RequestParam(required = false) String reason) {
        materialLockService.unlockMaterial(id, reason);
        return Result.success();
    }

    @GetMapping("/{id}/material-locks")
    public Result<List<MaterialLock>> getMaterialLocks(@PathVariable Long id) {
        return Result.success(materialLockService.getByOrderId(id));
    }

    @PutMapping("/{id}/status")
    @RequiresRole({UserRole.ADMIN, UserRole.PRODUCTION_LEADER, UserRole.QUALITY_INSPECTOR})
    @OperationLog(module = "工单管理", type = "状态变更", desc = "更新工单状态")
    public Result<Void> updateStatus(@PathVariable Long id, @RequestParam Integer status) {
        orderService.updateStatus(id, status, UserContext.getRole());
        return Result.success();
    }

    @PutMapping("/{id}/inspector")
    @RequiresRole({UserRole.ADMIN})
    @OperationLog(module = "工单管理", type = "指定质检员", desc = "指定工单质检员")
    public Result<Void> setInspector(@PathVariable Long id, @RequestParam Long inspectorId) {
        orderService.setInspector(id, inspectorId);
        return Result.success();
    }

    @PutMapping("/{id}/pause")
    @RequiresRole({UserRole.ADMIN, UserRole.PRODUCTION_LEADER})
    @OperationLog(module = "工单管理", type = "暂停", desc = "暂停工单")
    public Result<Void> pause(@PathVariable Long id, @RequestParam(required = false) String reason) {
        orderService.pause(id, reason);
        return Result.success();
    }

    @PutMapping("/{id}/resume")
    @RequiresRole({UserRole.ADMIN, UserRole.PRODUCTION_LEADER})
    @OperationLog(module = "工单管理", type = "恢复", desc = "恢复工单")
    public Result<Void> resume(@PathVariable Long id) {
        orderService.resume(id);
        return Result.success();
    }

    @PutMapping("/{id}/cancel")
    @RequiresRole({UserRole.ADMIN})
    @OperationLog(module = "工单管理", type = "取消", desc = "取消工单")
    public Result<Void> cancel(@PathVariable Long id, @RequestParam(required = false) String reason) {
        orderService.cancel(id, reason);
        return Result.success();
    }

    @PutMapping("/{id}/quantity")
    @RequiresRole({UserRole.ADMIN, UserRole.PRODUCTION_LEADER})
    @OperationLog(module = "工单管理", type = "更新数量", desc = "更新工单生产数量")
    public Result<Void> updateProductionQuantity(
            @PathVariable Long id,
            @RequestParam(required = false) Integer actualQuantity,
            @RequestParam(required = false) Integer defectiveQuantity
    ) {
        orderService.updateProductionQuantity(id, actualQuantity, defectiveQuantity);
        return Result.success();
    }

    @PostMapping("/loss")
    @RequiresRole({UserRole.ADMIN, UserRole.PRODUCTION_LEADER})
    @OperationLog(module = "工单管理", type = "记录损耗", desc = "记录生产损耗")
    public Result<Void> addLoss(@Valid @RequestBody ProductionLossDTO dto) {
        productionLossService.add(dto);
        return Result.success();
    }

    @GetMapping("/{id}/losses")
    public Result<List<ProductionLoss>> getLosses(@PathVariable Long id) {
        return Result.success(productionLossService.getByOrderId(id));
    }

    @DeleteMapping("/loss/{id}")
    @RequiresRole({UserRole.ADMIN})
    @OperationLog(module = "工单管理", type = "删除损耗", desc = "删除生产损耗记录")
    public Result<Void> deleteLoss(@PathVariable Long id) {
        productionLossService.delete(id);
        return Result.success();
    }
}
