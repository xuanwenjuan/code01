package com.gear.mfg.controller;

import com.gear.mfg.annotation.RequireRole;
import com.gear.mfg.common.Result;
import com.gear.mfg.entity.ProductionCost;
import com.gear.mfg.service.ProductionCostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cost")
@RequiredArgsConstructor
public class ProductionCostController {

    private final ProductionCostService productionCostService;

    @PostMapping
    @RequireRole({"PURCHASE", "PROCESS_ENGINEER"})
    public Result<Void> addCost(@Valid @RequestBody ProductionCost cost) {
        productionCostService.addCost(cost);
        return Result.success();
    }

    @PutMapping
    @RequireRole({"PURCHASE", "PROCESS_ENGINEER"})
    public Result<Void> updateCost(@Valid @RequestBody ProductionCost cost) {
        productionCostService.updateCost(cost);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @RequireRole({"PURCHASE"})
    public Result<Void> deleteCost(@PathVariable Long id) {
        productionCostService.deleteCost(id);
        return Result.success();
    }

    @GetMapping("/{id}")
    public Result<ProductionCost> getCostById(@PathVariable Long id) {
        return Result.success(productionCostService.getCostById(id));
    }

    @GetMapping("/list")
    public Result<List<ProductionCost>> getCostList(
            @RequestParam(required = false) String gearModel,
            @RequestParam(required = false) String settlementStatus) {
        return Result.success(productionCostService.getCostList(gearModel, settlementStatus));
    }

    @GetMapping("/order/{orderId}")
    public Result<List<ProductionCost>> getCostByOrderId(@PathVariable Long orderId) {
        return Result.success(productionCostService.getCostByOrderId(orderId));
    }

    @PutMapping("/{id}/settle")
    @RequireRole({"PURCHASE"})
    public Result<Void> settleCost(@PathVariable Long id) {
        productionCostService.settleCost(id);
        return Result.success();
    }
}