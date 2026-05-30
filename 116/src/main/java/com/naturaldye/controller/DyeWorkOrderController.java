package com.naturaldye.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.naturaldye.annotation.RequiresRole;
import com.naturaldye.common.Result;
import com.naturaldye.dto.WorkOrderCompleteDTO;
import com.naturaldye.dto.WorkOrderCreateDTO;
import com.naturaldye.dto.WorkOrderMaterialDTO;
import com.naturaldye.entity.DyeWorkOrder;
import com.naturaldye.entity.WorkOrderMaterial;
import com.naturaldye.enums.UserRoleEnum;
import com.naturaldye.service.DyeWorkOrderService;
import com.naturaldye.vo.CostDetailVO;
import com.naturaldye.vo.WorkOrderDetailVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/work-order")
@RequiredArgsConstructor
public class DyeWorkOrderController {

    private final DyeWorkOrderService dyeWorkOrderService;

    @PostMapping
    @RequiresRole({UserRoleEnum.ADMIN, UserRoleEnum.WORKSHOP_MANAGER})
    public Result<Long> createWorkOrder(@Valid @RequestBody WorkOrderCreateDTO createDTO) {
        Long id = dyeWorkOrderService.createWorkOrder(createDTO);
        return Result.success(id);
    }

    @PostMapping("/{id}/confirm-color")
    @RequiresRole({UserRoleEnum.ADMIN, UserRoleEnum.DYE_MASTER})
    public Result<Void> confirmColorAndLockInventory(
            @PathVariable Long id,
            @Valid @RequestBody List<WorkOrderMaterialDTO> materials) {
        dyeWorkOrderService.confirmColorAndLockInventory(id, materials);
        return Result.success();
    }

    @PutMapping("/{id}/next")
    @RequiresRole({UserRoleEnum.ADMIN, UserRoleEnum.DYE_MASTER})
    public Result<Void> processNextStatus(@PathVariable Long id) {
        dyeWorkOrderService.processNextStatus(id);
        return Result.success();
    }

    @PostMapping("/complete")
    @RequiresRole({UserRoleEnum.ADMIN, UserRoleEnum.DYE_MASTER})
    public Result<CostDetailVO> completeWorkOrder(@Valid @RequestBody WorkOrderCompleteDTO completeDTO) {
        CostDetailVO costDetail = dyeWorkOrderService.completeWorkOrder(completeDTO);
        return Result.success(costDetail);
    }

    @PutMapping("/{id}/pause")
    @RequiresRole({UserRoleEnum.ADMIN, UserRoleEnum.DYE_MASTER, UserRoleEnum.WORKSHOP_MANAGER})
    public Result<Void> pauseWorkOrder(@PathVariable Long id) {
        dyeWorkOrderService.pauseWorkOrder(id);
        return Result.success();
    }

    @PutMapping("/{id}/resume")
    @RequiresRole({UserRoleEnum.ADMIN, UserRoleEnum.DYE_MASTER, UserRoleEnum.WORKSHOP_MANAGER})
    public Result<Void> resumeWorkOrder(@PathVariable Long id) {
        dyeWorkOrderService.resumeWorkOrder(id);
        return Result.success();
    }

    @GetMapping("/page")
    @RequiresRole({UserRoleEnum.ADMIN, UserRoleEnum.DYE_MASTER, UserRoleEnum.WORKSHOP_MANAGER})
    public Result<Page<DyeWorkOrder>> getWorkOrderPage(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long assignedUserId) {
        Page<DyeWorkOrder> page = dyeWorkOrderService.getWorkOrderPage(
                pageNum, pageSize, status, categoryId, assignedUserId);
        return Result.success(page);
    }

    @GetMapping("/statistics")
    @RequiresRole({UserRoleEnum.ADMIN})
    public Result<Map<String, Long>> getWorkOrderStatistics() {
        Map<String, Long> statistics = dyeWorkOrderService.getWorkOrderStatistics();
        return Result.success(statistics);
    }

    @GetMapping("/{id}")
    @RequiresRole({UserRoleEnum.ADMIN, UserRoleEnum.DYE_MASTER, UserRoleEnum.WORKSHOP_MANAGER})
    public Result<WorkOrderDetailVO> getWorkOrderDetail(@PathVariable Long id) {
        WorkOrderDetailVO workOrder = dyeWorkOrderService.getWorkOrderDetail(id);
        return Result.success(workOrder);
    }

    @GetMapping("/{id}/materials")
    @RequiresRole({UserRoleEnum.ADMIN, UserRoleEnum.DYE_MASTER, UserRoleEnum.FABRIC_PURCHASER, UserRoleEnum.WORKSHOP_MANAGER})
    public Result<List<WorkOrderMaterial>> getWorkOrderMaterials(@PathVariable Long id) {
        List<WorkOrderMaterial> materials = dyeWorkOrderService.getWorkOrderMaterials(id);
        return Result.success(materials);
    }
}
