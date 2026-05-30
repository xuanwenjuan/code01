package com.fan.impeller.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fan.impeller.annotation.RequiresRole;
import com.fan.impeller.common.Constants;
import com.fan.impeller.common.PageQuery;
import com.fan.impeller.common.Result;
import com.fan.impeller.entity.PurchaseOrder;
import com.fan.impeller.service.PurchaseOrderService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/purchase-order")
@RequiredArgsConstructor
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    @GetMapping("/page")
    public Result<Page<PurchaseOrder>> page(PageQuery query,
                                             @RequestParam(required = false) Integer status,
                                             @RequestParam(required = false) String materialType) {
        return Result.success(purchaseOrderService.page(query, status, materialType));
    }

    @GetMapping("/{id}")
    public Result<PurchaseOrder> getById(@PathVariable Long id) {
        return Result.success(purchaseOrderService.getById(id));
    }

    @PostMapping
    @RequiresRole({Constants.ROLE_PURCHASE})
    public Result<Void> create(@RequestBody PurchaseOrder order) {
        purchaseOrderService.createPurchaseOrder(order);
        return Result.success();
    }

    @PutMapping("/audit")
    @RequiresRole({Constants.ROLE_ADMIN})
    public Result<Void> audit(@RequestBody AuditRequest request) {
        purchaseOrderService.audit(request.getId(), request.getStatus(), request.getRemark());
        return Result.success();
    }

    @PutMapping("/stock-in/{id}")
    @RequiresRole({Constants.ROLE_PURCHASE})
    public Result<Void> stockIn(@PathVariable Long id) {
        purchaseOrderService.stockIn(id);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @RequiresRole({Constants.ROLE_ADMIN})
    public Result<Void> delete(@PathVariable Long id) {
        purchaseOrderService.removeById(id);
        return Result.success();
    }

    @Data
    public static class AuditRequest {
        private Long id;
        private Integer status;
        private String remark;
    }
}
