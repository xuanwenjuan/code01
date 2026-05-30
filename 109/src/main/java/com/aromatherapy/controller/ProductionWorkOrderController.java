package com.aromatherapy.controller;

import com.aromatherapy.annotation.RequiresPermission;
import com.aromatherapy.annotation.RequiresRole;
import com.aromatherapy.common.Result;
import com.aromatherapy.dto.WorkOrderCreateDTO;
import com.aromatherapy.entity.ProductionWorkOrder;
import com.aromatherapy.service.ProductionWorkOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/work-order")
@RequiredArgsConstructor
public class ProductionWorkOrderController {

    private final ProductionWorkOrderService workOrderService;

    @GetMapping
    @RequiresPermission("workorder:read")
    public Result<List<ProductionWorkOrder>> list(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String customerName) {
        return Result.success(workOrderService.list(status, customerName));
    }

    @GetMapping("/{id}")
    @RequiresPermission("workorder:read")
    public Result<ProductionWorkOrder> getById(@PathVariable Long id) {
        return Result.success(workOrderService.getById(id));
    }

    @PostMapping
    @RequiresPermission("workorder:create")
    public Result<Void> create(@Valid @RequestBody WorkOrderCreateDTO dto) {
        workOrderService.create(dto);
        return Result.success();
    }

    @PutMapping("/{id}/confirm-formula")
    @RequiresPermission("workorder:mixing")
    public Result<Void> confirmFormula(@PathVariable Long id, @RequestParam Long perfumerId) {
        workOrderService.confirmFormula(id, perfumerId);
        return Result.success();
    }

    @PutMapping("/{id}/start-mixing")
    @RequiresPermission("workorder:mixing")
    public Result<Void> startMixing(@PathVariable Long id) {
        workOrderService.startMixing(id);
        return Result.success();
    }

    @PutMapping("/{id}/finish-mixing")
    @RequiresPermission("workorder:mixing")
    public Result<Void> finishMixing(@PathVariable Long id, @RequestParam BigDecimal actualQuantity) {
        workOrderService.finishMixing(id, actualQuantity);
        return Result.success();
    }

    @PutMapping("/{id}/finish-aging")
    @RequiresPermission("workorder:mixing")
    public Result<Void> finishAging(@PathVariable Long id) {
        workOrderService.finishAging(id);
        return Result.success();
    }

    @PutMapping("/{id}/quality-check")
    @RequiresPermission("workorder:qc")
    public Result<Void> qualityCheck(
            @PathVariable Long id,
            @RequestParam boolean passed,
            @RequestParam(required = false) String result) {
        workOrderService.qualityCheck(id, passed, result);
        return Result.success();
    }

    @PutMapping("/{id}/package")
    @RequiresPermission("workorder:package")
    public Result<Void> packageOrder(@PathVariable Long id, @RequestParam Long warehouseId) {
        workOrderService.packageOrder(id, warehouseId);
        return Result.success();
    }

    @PutMapping("/{id}/ship")
    @RequiresPermission("workorder:ship")
    public Result<Void> shipOrder(@PathVariable Long id) {
        workOrderService.shipOrder(id);
        return Result.success();
    }

    @PutMapping("/{id}/suspend")
    @RequiresRole({"ADMIN"})
    public Result<Void> suspendOrder(@PathVariable Long id) {
        workOrderService.suspendOrder(id);
        return Result.success();
    }

    @PutMapping("/{id}/cancel")
    @RequiresRole({"ADMIN"})
    public Result<Void> cancelOrder(@PathVariable Long id) {
        workOrderService.cancelOrder(id);
        return Result.success();
    }
}
