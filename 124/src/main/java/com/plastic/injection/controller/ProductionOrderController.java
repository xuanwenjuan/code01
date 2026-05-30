package com.plastic.injection.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.plastic.injection.annotation.RequirePermission;
import com.plastic.injection.common.Result;
import com.plastic.injection.dto.OrderMaterialDTO;
import com.plastic.injection.dto.ProductionOrderDTO;
import com.plastic.injection.enums.PermissionType;
import com.plastic.injection.service.ProductionOrderService;
import com.plastic.injection.vo.ProductionOrderVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/production-order")
@RequiredArgsConstructor
public class ProductionOrderController {

    private final ProductionOrderService productionOrderService;

    @PostMapping
    @RequirePermission(PermissionType.ORDER_MANAGE)
    public Result<String> create(@Valid @RequestBody ProductionOrderDTO dto) {
        return Result.success(productionOrderService.createOrder(dto));
    }

    @PutMapping("/{id}")
    @RequirePermission(PermissionType.ORDER_MANAGE)
    public Result<Void> update(@PathVariable Long id, @Valid @RequestBody ProductionOrderDTO dto) {
        productionOrderService.updateOrder(id, dto);
        return Result.success();
    }

    @PutMapping("/{id}/start")
    @RequirePermission(PermissionType.ORDER_MANAGE)
    public Result<Void> startProduction(@PathVariable Long id) {
        productionOrderService.startProduction(id);
        return Result.success();
    }

    @PutMapping("/{id}/next-process")
    @RequirePermission(PermissionType.ORDER_PROCESS)
    public Result<Void> nextProcess(@PathVariable Long id) {
        productionOrderService.nextProcess(id);
        return Result.success();
    }

    @PutMapping("/{id}/complete")
    @RequirePermission(PermissionType.ORDER_MANAGE)
    public Result<Void> qualityCheckComplete(
            @PathVariable Long id,
            @RequestParam BigDecimal actualQuantity,
            @RequestParam BigDecimal defectiveQuantity) {
        productionOrderService.qualityCheckComplete(id, actualQuantity, defectiveQuantity);
        return Result.success();
    }

    @PutMapping("/{id}/materials")
    @RequirePermission(PermissionType.ORDER_MANAGE)
    public Result<Void> updateMaterialUsage(
            @PathVariable Long id,
            @RequestBody List<OrderMaterialDTO> materials) {
        productionOrderService.updateMaterialUsage(id, materials);
        return Result.success();
    }

    @GetMapping("/page")
    @RequirePermission(PermissionType.ORDER_VIEW)
    public Result<Page<ProductionOrderVO>> page(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String orderNo,
            @RequestParam(required = false) String productName,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Integer orderStatus,
            @RequestParam(required = false) Long technicianId) {
        return Result.success(productionOrderService.pageQuery(pageNum, pageSize, orderNo, productName,
                categoryId, orderStatus, technicianId));
    }

    @GetMapping("/{id}")
    public Result<ProductionOrderVO> getById(@PathVariable Long id) {
        return Result.success(productionOrderService.getDetailById(id));
    }

    @DeleteMapping("/{id}")
    @RequirePermission(PermissionType.ORDER_MANAGE)
    public Result<Void> cancel(@PathVariable Long id) {
        productionOrderService.cancelOrder(id);
        return Result.success();
    }
}
