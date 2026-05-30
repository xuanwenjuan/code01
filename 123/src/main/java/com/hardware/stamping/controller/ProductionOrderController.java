package com.hardware.stamping.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.hardware.stamping.annotation.RequiresRole;
import com.hardware.stamping.common.Result;
import com.hardware.stamping.dto.ConfirmProcessDTO;
import com.hardware.stamping.dto.ProductionOrderQueryDTO;
import com.hardware.stamping.dto.ScrapReportDTO;
import com.hardware.stamping.entity.ProductionOrder;
import com.hardware.stamping.service.ProductionOrderService;
import com.hardware.stamping.vo.ProductionOrderVO;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/production-order")
public class ProductionOrderController {

    @Autowired
    private ProductionOrderService productionOrderService;

    @PostMapping
    @RequiresRole({"ADMIN", "FOREMAN"})
    public Result<Void> createOrder(@Valid @RequestBody ProductionOrder order) {
        productionOrderService.createOrder(order);
        return Result.success();
    }

    @PutMapping
    @RequiresRole({"ADMIN", "FOREMAN"})
    public Result<Void> updateOrder(@Valid @RequestBody ProductionOrder order) {
        productionOrderService.updateOrder(order);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @RequiresRole({"ADMIN"})
    public Result<Void> deleteOrder(@PathVariable Long id) {
        productionOrderService.deleteOrder(id);
        return Result.success();
    }

    @GetMapping("/{id}")
    public Result<ProductionOrder> getOrderById(@PathVariable Long id) {
        return Result.success(productionOrderService.getOrderById(id));
    }

    @GetMapping("/list")
    public Result<List<ProductionOrder>> listAll() {
        return Result.success(productionOrderService.listAll());
    }

    @PostMapping("/page")
    public Result<IPage<ProductionOrderVO>> queryPage(@RequestBody ProductionOrderQueryDTO queryDTO) {
        return Result.success(productionOrderService.queryPage(queryDTO));
    }

    @GetMapping("/status/{status}")
    public Result<List<ProductionOrder>> listByStatus(@PathVariable Integer status) {
        return Result.success(productionOrderService.listByStatus(status));
    }

    @GetMapping("/timeout")
    @RequiresRole({"ADMIN", "FOREMAN"})
    public Result<List<ProductionOrder>> getTimeoutOrders() {
        return Result.success(productionOrderService.getTimeoutOrders());
    }

    @PutMapping("/{id}/start")
    @RequiresRole({"ADMIN", "FOREMAN", "TECHNICIAN"})
    public Result<Void> startProduction(@PathVariable Long id) {
        productionOrderService.startProduction(id);
        return Result.success();
    }

    @PutMapping("/{id}/cutting")
    @RequiresRole({"ADMIN", "FOREMAN", "TECHNICIAN"})
    public Result<Void> completeCutting(@PathVariable Long id) {
        productionOrderService.completeCutting(id);
        return Result.success();
    }

    @PutMapping("/{id}/mold-setup")
    @RequiresRole({"ADMIN", "FOREMAN", "TECHNICIAN"})
    public Result<Void> completeMoldSetup(@PathVariable Long id) {
        productionOrderService.completeMoldSetup(id);
        return Result.success();
    }

    @PutMapping("/{id}/stamping")
    @RequiresRole({"ADMIN", "FOREMAN", "TECHNICIAN"})
    public Result<Void> completeStamping(@PathVariable Long id) {
        productionOrderService.completeStamping(id);
        return Result.success();
    }

    @PutMapping("/{id}/deburring")
    @RequiresRole({"ADMIN", "FOREMAN", "TECHNICIAN"})
    public Result<Void> completeDeburring(@PathVariable Long id) {
        productionOrderService.completeDeburring(id);
        return Result.success();
    }

    @PutMapping("/{id}/inspection")
    @RequiresRole({"ADMIN", "FOREMAN", "TECHNICIAN"})
    public Result<Void> completeInspection(@PathVariable Long id, @RequestBody Map<String, BigDecimal> params) {
        BigDecimal qualifiedQuantity = params.get("qualifiedQuantity");
        BigDecimal scrapQuantity = params.get("scrapQuantity");
        productionOrderService.completeInspection(id, qualifiedQuantity, scrapQuantity);
        return Result.success();
    }

    @PutMapping("/{id}/warehousing")
    @RequiresRole({"ADMIN", "FOREMAN"})
    public Result<Void> completeWarehousing(@PathVariable Long id) {
        productionOrderService.completeWarehousing(id);
        return Result.success();
    }

    @PutMapping("/{id}/auto-flow")
    @RequiresRole({"ADMIN", "FOREMAN"})
    public Result<Void> autoFlowNext(@PathVariable Long id) {
        productionOrderService.autoFlowNext(id);
        return Result.success();
    }

    @PostMapping("/batch-auto-flow")
    @RequiresRole({"ADMIN", "FOREMAN"})
    public Result<Void> batchAutoFlow(@RequestBody List<Long> ids) {
        productionOrderService.batchAutoFlow(ids);
        return Result.success();
    }

    @PostMapping("/confirm-process")
    @RequiresRole({"ADMIN", "FOREMAN"})
    public Result<Void> confirmProcess(@Valid @RequestBody ConfirmProcessDTO dto) {
        productionOrderService.confirmProcess(dto);
        return Result.success();
    }

    @PostMapping("/report-scrap")
    @RequiresRole({"ADMIN", "FOREMAN", "TECHNICIAN"})
    public Result<Void> reportScrap(@Valid @RequestBody ScrapReportDTO dto) {
        productionOrderService.reportScrap(dto);
        return Result.success();
    }
}
