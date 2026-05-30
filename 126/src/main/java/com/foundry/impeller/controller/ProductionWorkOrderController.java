package com.foundry.impeller.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.foundry.impeller.annotation.RequiresRole;
import com.foundry.impeller.common.Result;
import com.foundry.impeller.dto.WorkOrderStatusDTO;
import com.foundry.impeller.entity.ProductionWorkOrder;
import com.foundry.impeller.service.ProductionWorkOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/work-orders")
@RequiredArgsConstructor
public class ProductionWorkOrderController {

    private final ProductionWorkOrderService workOrderService;

    @GetMapping
    public Result<Page<ProductionWorkOrder>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status) {
        return Result.success(workOrderService.list(page, size, status));
    }

    @GetMapping("/{id}")
    public Result<ProductionWorkOrder> getDetail(@PathVariable Long id) {
        return Result.success(workOrderService.getDetail(id));
    }

    @PostMapping
    @RequiresRole({"PROCESS", "ADMIN"})
    public Result<Void> create(@Valid @RequestBody ProductionWorkOrder workOrder) {
        workOrderService.create(workOrder);
        return Result.success();
    }

    @PostMapping("/process")
    @RequiresRole({"PROCESS", "TEAM_LEADER", "INSPECTOR", "ADMIN"})
    public Result<Void> processStatus(@Valid @RequestBody WorkOrderStatusDTO statusDTO) {
        workOrderService.processStatus(statusDTO);
        return Result.success();
    }

    @PostMapping("/{id}/freeze")
    @RequiresRole({"PROCESS", "ADMIN"})
    public Result<Void> freezeOrder(@PathVariable Long id) {
        workOrderService.freezeOrder(id);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @RequiresRole({"ADMIN"})
    public Result<Void> delete(@PathVariable Long id) {
        workOrderService.delete(id);
        return Result.success();
    }
}
