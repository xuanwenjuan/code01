package com.instrument.consignment.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.instrument.consignment.annotation.RequiresRole;
import com.instrument.consignment.common.Result;
import com.instrument.consignment.dto.WorkOrderDTO;
import com.instrument.consignment.entity.RefurbishWorkOrder;
import com.instrument.consignment.entity.WorkOrderStep;
import com.instrument.consignment.enums.UserRoleEnum;
import com.instrument.consignment.service.RefurbishWorkOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/work-orders")
@RequiredArgsConstructor
public class WorkOrderController {

    private final RefurbishWorkOrderService workOrderService;

    @PostMapping
    @RequiresRole({UserRoleEnum.ADMIN, UserRoleEnum.WAREHOUSE})
    public Result<Void> createWorkOrder(@Valid @RequestBody WorkOrderDTO workOrderDTO) {
        workOrderService.createWorkOrder(workOrderDTO);
        return Result.success();
    }

    @PutMapping("/{id}/status")
    @RequiresRole({UserRoleEnum.ADMIN, UserRoleEnum.ESTIMATOR, UserRoleEnum.CRAFTSMAN})
    public Result<Void> updateWorkOrderStatus(@PathVariable Long id, @RequestParam String status) {
        workOrderService.updateWorkOrderStatus(id, status);
        return Result.success();
    }

    @GetMapping("/page")
    public Result<Page<RefurbishWorkOrder>> getWorkOrderPage(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long craftsmanId,
            @RequestParam(required = false) Long estimatorId) {
        return Result.success(workOrderService.getWorkOrderPage(page, size, status, craftsmanId, estimatorId));
    }

    @GetMapping("/{id}")
    public Result<RefurbishWorkOrder> getWorkOrderDetail(@PathVariable Long id) {
        return Result.success(workOrderService.getWorkOrderDetail(id));
    }

    @PutMapping("/steps/{stepId}")
    @RequiresRole({UserRoleEnum.ADMIN, UserRoleEnum.CRAFTSMAN})
    public Result<Void> updateWorkOrderStep(@PathVariable Long stepId, @RequestBody WorkOrderStep stepDTO) {
        workOrderService.updateWorkOrderStep(stepId, stepDTO);
        return Result.success();
    }

    @PutMapping("/{id}/start-estimation")
    @RequiresRole({UserRoleEnum.ADMIN, UserRoleEnum.ESTIMATOR})
    public Result<Void> startEstimation(@PathVariable Long id, @RequestParam Long estimatorId) {
        workOrderService.startEstimation(id, estimatorId);
        return Result.success();
    }

    @PutMapping("/{id}/submit-estimation")
    @RequiresRole({UserRoleEnum.ADMIN, UserRoleEnum.ESTIMATOR})
    public Result<Void> submitEstimation(@PathVariable Long id, @RequestParam(required = false) String remark) {
        workOrderService.submitEstimation(id, remark);
        return Result.success();
    }

    @PutMapping("/{id}/start-refurbish")
    @RequiresRole({UserRoleEnum.ADMIN, UserRoleEnum.CRAFTSMAN})
    public Result<Void> startRefurbish(@PathVariable Long id, @RequestParam Long craftsmanId) {
        workOrderService.startRefurbish(id, craftsmanId);
        return Result.success();
    }

    @PutMapping("/{id}/complete")
    @RequiresRole({UserRoleEnum.ADMIN, UserRoleEnum.CRAFTSMAN})
    public Result<Void> completeWorkOrder(@PathVariable Long id) {
        workOrderService.completeWorkOrder(id);
        return Result.success();
    }
}
