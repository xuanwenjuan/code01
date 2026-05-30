package com.incense.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.incense.annotation.OperationLog;
import com.incense.annotation.RequiresRole;
import com.incense.common.Result;
import com.incense.dto.MaterialUsageDTO;
import com.incense.dto.OrderFormulaConfirmDTO;
import com.incense.dto.ProductionOrderDTO;
import com.incense.entity.OrderMaterialUsage;
import com.incense.entity.OrderProcessLog;
import com.incense.entity.ProductionOrder;
import com.incense.service.OrderMaterialUsageService;
import com.incense.service.OrderProcessLogService;
import com.incense.service.ProductionCostService;
import com.incense.service.ProductionOrderService;
import com.incense.vo.ProductionCostVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/order")
@RequiredArgsConstructor
public class ProductionOrderController {

    private final ProductionOrderService productionOrderService;
    private final OrderProcessLogService processLogService;
    private final OrderMaterialUsageService materialUsageService;
    private final ProductionCostService productionCostService;

    @GetMapping("/page")
    public Result<Page<ProductionOrder>> getPage(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long categoryId) {
        return Result.success(productionOrderService.getPage(pageNum, pageSize, status, categoryId));
    }

    @GetMapping("/stats")
    public Result<Map<String, Long>> getOrderStats() {
        return Result.success(productionOrderService.getOrderStatusStats());
    }

    @GetMapping("/{id}/status-cache")
    public Result<String> getOrderStatusFromCache(@PathVariable Long id) {
        return Result.success(productionOrderService.getOrderStatusFromCache(id));
    }

    @GetMapping("/{id}")
    public Result<ProductionOrder> getById(@PathVariable Long id) {
        return Result.success(productionOrderService.getById(id));
    }

    @GetMapping("/{id}/logs")
    public Result<List<OrderProcessLog>> getLogs(@PathVariable Long id) {
        return Result.success(processLogService.getByOrderId(id));
    }

    @GetMapping("/{id}/materials")
    public Result<List<OrderMaterialUsage>> getMaterialUsages(@PathVariable Long id) {
        return Result.success(materialUsageService.getByOrderId(id));
    }

    @GetMapping("/{id}/cost")
    public Result<ProductionCostVO> getOrderCost(@PathVariable Long id) {
        return Result.success(productionCostService.getCostByOrderId(id));
    }

    @PostMapping
    @RequiresRole({"ADMIN", "MASTER"})
    @OperationLog(module = "工单管理", operation = "创建工单")
    public Result<Void> create(@Valid @RequestBody ProductionOrderDTO dto) {
        productionOrderService.createOrder(dto);
        return Result.success();
    }

    @PutMapping("/{id}/confirm-formula")
    @RequiresRole({"ADMIN", "MASTER"})
    @OperationLog(module = "工单管理", operation = "确认配方")
    public Result<Void> confirmFormula(@PathVariable Long id, @Valid @RequestBody OrderFormulaConfirmDTO dto) {
        dto.setOrderId(id);
        productionOrderService.confirmFormula(id, dto.getFormulaDetail(), dto.getMaterialList());
        return Result.success();
    }

    @PutMapping("/{id}/start-mixing")
    @RequiresRole({"ADMIN", "MASTER"})
    @OperationLog(module = "工单管理", operation = "开始拌料")
    public Result<Void> startMixing(@PathVariable Long id) {
        productionOrderService.startMixing(id);
        return Result.success();
    }

    @PutMapping("/{id}/start-kneading")
    @RequiresRole({"ADMIN", "MASTER"})
    @OperationLog(module = "工单管理", operation = "开始揉泥挤香")
    public Result<Void> startKneading(@PathVariable Long id, @RequestParam(required = false) String remark) {
        productionOrderService.startKneading(id, remark);
        return Result.success();
    }

    @PutMapping("/{id}/start-drying")
    @RequiresRole({"ADMIN", "MASTER"})
    @OperationLog(module = "工单管理", operation = "开始晾晒阴干")
    public Result<Void> startDrying(@PathVariable Long id, @RequestParam(required = false) String remark) {
        productionOrderService.startDrying(id, remark);
        return Result.success();
    }

    @PutMapping("/{id}/start-cutting")
    @RequiresRole({"ADMIN", "MASTER"})
    @OperationLog(module = "工单管理", operation = "开始裁切规整")
    public Result<Void> startCutting(@PathVariable Long id, @RequestParam(required = false) String remark) {
        productionOrderService.startCutting(id, remark);
        return Result.success();
    }

    @PutMapping("/{id}/finish-packaging")
    @RequiresRole({"ADMIN", "MASTER"})
    @OperationLog(module = "工单管理", operation = "完成封装入库")
    public Result<Void> finishPackaging(
            @PathVariable Long id,
            @RequestParam(required = false) String remark,
            @RequestBody(required = false) List<MaterialUsageDTO> materialUsages) {
        productionOrderService.finishPackaging(id, remark, materialUsages);
        return Result.success();
    }

    @PutMapping("/{id}/freeze")
    @RequiresRole({"ADMIN"})
    @OperationLog(module = "工单管理", operation = "冻结工单")
    public Result<Void> freeze(@PathVariable Long id, @RequestParam String reason) {
        productionOrderService.freezeOrder(id, reason);
        return Result.success();
    }

    @PutMapping("/{id}/unfreeze")
    @RequiresRole({"ADMIN"})
    @OperationLog(module = "工单管理", operation = "解冻工单")
    public Result<Void> unfreeze(@PathVariable Long id, @RequestParam(required = false) String remark) {
        productionOrderService.unfreezeOrder(id, remark);
        return Result.success();
    }

    @PutMapping("/{id}/cancel")
    @RequiresRole({"ADMIN"})
    @OperationLog(module = "工单管理", operation = "取消工单")
    public Result<Void> cancel(@PathVariable Long id, @RequestParam String reason) {
        productionOrderService.cancelOrder(id, reason);
        return Result.success();
    }
}
