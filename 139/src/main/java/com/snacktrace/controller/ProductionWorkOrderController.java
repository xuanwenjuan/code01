package com.snacktrace.controller;

import com.snacktrace.annotation.RequireRole;
import com.snacktrace.common.Result;
import com.snacktrace.dto.WorkOrderCreateDTO;
import com.snacktrace.entity.ProductionWorkOrder;
import com.snacktrace.entity.WorkOrderMaterial;
import com.snacktrace.entity.WorkOrderProcess;
import com.snacktrace.enums.RoleEnum;
import com.snacktrace.service.ProductionWorkOrderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/workorder")
public class ProductionWorkOrderController {

    @Autowired
    private ProductionWorkOrderService workOrderService;

    @GetMapping("/list")
    public Result<List<ProductionWorkOrder>> getOrderList(
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) Integer status) {
        List<ProductionWorkOrder> list = workOrderService.getOrderList(productId, status);
        return Result.success(list);
    }

    @PostMapping
    @RequireRole({RoleEnum.ADMIN, RoleEnum.R_D})
    public Result<Void> createOrder(@Valid @RequestBody WorkOrderCreateDTO dto) {
        boolean success = workOrderService.createOrder(dto);
        return success ? Result.success("创建成功", null) : Result.error("创建失败");
    }

    @PutMapping("/process/next/{id}")
    @RequireRole({RoleEnum.ADMIN, RoleEnum.TEAM_LEADER})
    public Result<Void> startNextProcess(@PathVariable Long id, @RequestParam(required = false) String remark) {
        boolean success = workOrderService.startNextProcess(id, remark);
        return success ? Result.success("流程推进成功", null) : Result.error("流程推进失败");
    }

    @PostMapping("/material")
    @RequireRole({RoleEnum.ADMIN, RoleEnum.TEAM_LEADER})
    public Result<Void> addOrderMaterial(
            @RequestParam Long workOrderId,
            @RequestParam Long materialId,
            @RequestParam Long batchId,
            @RequestParam String materialName,
            @RequestParam String batchCode,
            @RequestParam BigDecimal quantity,
            @RequestParam BigDecimal unitPrice) {
        boolean success = workOrderService.addOrderMaterial(workOrderId, materialId, batchId,
                materialName, batchCode, quantity, unitPrice);
        return success ? Result.success("用料添加成功", null) : Result.error("用料添加失败");
    }

    @GetMapping("/{workOrderId}/materials")
    public Result<List<WorkOrderMaterial>> getOrderMaterials(@PathVariable Long workOrderId) {
        List<WorkOrderMaterial> list = workOrderService.getOrderMaterials(workOrderId);
        return Result.success(list);
    }

    @GetMapping("/{workOrderId}/processes")
    public Result<List<WorkOrderProcess>> getOrderProcesses(@PathVariable Long workOrderId) {
        List<WorkOrderProcess> list = workOrderService.getOrderProcesses(workOrderId);
        return Result.success(list);
    }

    @PutMapping("/complete/{id}")
    @RequireRole({RoleEnum.ADMIN, RoleEnum.TEAM_LEADER})
    public Result<Void> completeOrder(@PathVariable Long id) {
        boolean success = workOrderService.completeOrder(id);
        return success ? Result.success("工单已完成", null) : Result.error("操作失败");
    }

    @PutMapping("/shelve/{id}")
    @RequireRole({RoleEnum.ADMIN, RoleEnum.TEAM_LEADER})
    public Result<Void> shelveOrder(@PathVariable Long id, @RequestParam String remark) {
        boolean success = workOrderService.shelveOrder(id, remark);
        return success ? Result.success("工单已搁置", null) : Result.error("操作失败");
    }
}
