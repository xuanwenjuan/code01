package com.valve.manufacture.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.valve.manufacture.annotation.RequiresRole;
import com.valve.manufacture.common.Result;
import com.valve.manufacture.constant.RoleConstants;
import com.valve.manufacture.dto.ProductionLossDTO;
import com.valve.manufacture.entity.ProductionCost;
import com.valve.manufacture.entity.ProductionLoss;
import com.valve.manufacture.service.ProductionCostService;
import com.valve.manufacture.service.ProductionLossService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/production-costs")
@RequiredArgsConstructor
@RequiresRole({RoleConstants.ADMIN, RoleConstants.PROCESS, RoleConstants.PRODUCTION})
public class ProductionCostController {

    private final ProductionCostService productionCostService;
    private final ProductionLossService productionLossService;

    @GetMapping
    public Result<Page<ProductionCost>> page(
            @RequestParam(defaultValue = "1") Integer current,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) Long workOrderId,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        Page<ProductionCost> page = productionCostService.page(current, size, workOrderId, startDate, endDate);
        return Result.success(page);
    }

    @GetMapping("/{id}")
    public Result<ProductionCost> getById(@PathVariable Long id) {
        ProductionCost cost = productionCostService.getDetail(id);
        return Result.success(cost);
    }

    @GetMapping("/work-order/{workOrderId}")
    public Result<ProductionCost> getByWorkOrderId(@PathVariable Long workOrderId) {
        ProductionCost cost = productionCostService.getByWorkOrderId(workOrderId);
        return Result.success(cost);
    }

    @PostMapping("/calculate/{workOrderId}")
    @RequiresRole({RoleConstants.ADMIN, RoleConstants.PROCESS})
    public Result<ProductionCost> calculate(@PathVariable Long workOrderId,
                                             @RequestAttribute Long userId) {
        ProductionCost cost = productionCostService.calculate(workOrderId, userId);
        return Result.success("成本计算完成", cost);
    }

    @PostMapping("/recalculate/{id}")
    @RequiresRole({RoleConstants.ADMIN, RoleConstants.PROCESS})
    public Result<ProductionCost> recalculate(@PathVariable Long id,
                                               @RequestAttribute Long userId) {
        ProductionCost cost = productionCostService.recalculate(id, userId);
        return Result.success("成本重算完成", cost);
    }

    @GetMapping("/{id}/losses")
    public Result<List<ProductionLoss>> getLosses(@PathVariable Long id) {
        List<ProductionLoss> losses = productionLossService.getByCostId(id);
        return Result.success(losses);
    }

    @PostMapping("/losses")
    @RequiresRole({RoleConstants.ADMIN, RoleConstants.PRODUCTION})
    public Result<ProductionLoss> addLoss(@Valid @RequestBody ProductionLossDTO dto,
                                           @RequestAttribute Long userId) {
        ProductionLoss loss = new ProductionLoss();
        loss.setWorkOrderId(dto.getWorkOrderId());
        loss.setProcessId(dto.getProcessId());
        loss.setLossType(dto.getLossType());
        loss.setMaterialId(dto.getMaterialId());
        loss.setLossQuantity(dto.getLossQuantity() != null ? dto.getLossQuantity() : BigDecimal.ZERO);
        loss.setUnitPrice(dto.getUnitPrice() != null ? dto.getUnitPrice() : BigDecimal.ZERO);
        loss.setScrapCount(dto.getScrapCount() != null ? dto.getScrapCount() : 0);
        loss.setScrapCost(dto.getScrapCost() != null ? dto.getScrapCost() : BigDecimal.ZERO);
        loss.setToolWearCost(dto.getToolWearCost() != null ? dto.getToolWearCost() : BigDecimal.ZERO);
        loss.setEnergyCost(dto.getEnergyCost() != null ? dto.getEnergyCost() : BigDecimal.ZERO);
        loss.setRemark(dto.getRemark());
        loss.setOperatorId(userId);
        
        ProductionLoss saved = productionLossService.addLoss(loss);
        return Result.success("损耗添加成功", saved);
    }

    @PostMapping("/auto-collect/{workOrderId}")
    @RequiresRole({RoleConstants.ADMIN, RoleConstants.PRODUCTION})
    public Result<List<ProductionLoss>> autoCollectLosses(@PathVariable Long workOrderId,
                                                           @RequestAttribute Long userId) {
        List<ProductionLoss> losses = productionCostService.autoCollectLosses(workOrderId, userId);
        return Result.success("损耗自动归集完成", losses);
    }

    @DeleteMapping("/losses/{id}")
    @RequiresRole(RoleConstants.ADMIN)
    public Result<Void> deleteLoss(@PathVariable Long id) {
        productionLossService.delete(id);
        return Result.success("删除成功");
    }

    @GetMapping("/statistics")
    public Result<Map<String, BigDecimal>> getStatistics(
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        Map<String, BigDecimal> statistics = productionCostService.getStatistics(startDate, endDate);
        return Result.success(statistics);
    }
}
