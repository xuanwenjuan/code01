package com.horncomb.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.horncomb.annotation.RequireRole;
import com.horncomb.common.Constants;
import com.horncomb.common.Result;
import com.horncomb.dto.WorkOrderDTO;
import com.horncomb.dto.WorkOrderStatusDTO;
import com.horncomb.entity.ProductionWorkOrder;
import com.horncomb.service.ProductionWorkOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/workorder")
@RequiredArgsConstructor
public class ProductionWorkOrderController {

    private final ProductionWorkOrderService productionWorkOrderService;

    @GetMapping("/page")
    @RequireRole({Constants.ROLE_ADMIN, Constants.ROLE_CRAFTSMAN, Constants.ROLE_WAREHOUSE_MANAGER})
    public Result<IPage<ProductionWorkOrder>> page(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long craftsmanId,
            @RequestParam(required = false) Long categoryId
    ) {
        IPage<ProductionWorkOrder> page = productionWorkOrderService.page(pageNum, pageSize, status, craftsmanId, categoryId);
        return Result.success(page);
    }

    @GetMapping("/{id}")
    @RequireRole({Constants.ROLE_ADMIN, Constants.ROLE_CRAFTSMAN, Constants.ROLE_WAREHOUSE_MANAGER})
    public Result<ProductionWorkOrder> getById(@PathVariable Long id) {
        ProductionWorkOrder order = productionWorkOrderService.getById(id);
        return Result.success(order);
    }

    @PostMapping
    @RequireRole({Constants.ROLE_ADMIN, Constants.ROLE_WAREHOUSE_MANAGER})
    public Result<Void> create(@Valid @RequestBody WorkOrderDTO dto) {
        productionWorkOrderService.create(dto);
        return Result.success("创建成功", null);
    }

    @PutMapping("/status")
    @RequireRole({Constants.ROLE_ADMIN, Constants.ROLE_CRAFTSMAN})
    public Result<Void> updateStatus(@Valid @RequestBody WorkOrderStatusDTO dto) {
        productionWorkOrderService.updateStatus(dto);
        return Result.success("状态更新成功", null);
    }

    @PutMapping("/{id}/suspend")
    @RequireRole({Constants.ROLE_ADMIN, Constants.ROLE_WAREHOUSE_MANAGER})
    public Result<Void> suspend(@PathVariable Long id) {
        productionWorkOrderService.suspend(id);
        return Result.success("工单已搁置", null);
    }

    @PutMapping("/{id}/restart")
    @RequireRole({Constants.ROLE_ADMIN, Constants.ROLE_WAREHOUSE_MANAGER})
    public Result<Void> restart(@PathVariable Long id) {
        productionWorkOrderService.restart(id);
        return Result.success("工单已重启", null);
    }

    @DeleteMapping("/{id}")
    @RequireRole({Constants.ROLE_ADMIN, Constants.ROLE_WAREHOUSE_MANAGER})
    public Result<Void> delete(@PathVariable Long id) {
        productionWorkOrderService.delete(id);
        return Result.success("删除成功", null);
    }
}
