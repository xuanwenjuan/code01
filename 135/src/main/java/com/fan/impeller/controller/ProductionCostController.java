package com.fan.impeller.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fan.impeller.common.PageQuery;
import com.fan.impeller.common.Result;
import com.fan.impeller.dto.ProductionCostDTO;
import com.fan.impeller.entity.ProductionCost;
import com.fan.impeller.entity.WorkOrderMaterial;
import com.fan.impeller.service.ProductionCostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/production-cost")
@RequiredArgsConstructor
public class ProductionCostController {

    private final ProductionCostService productionCostService;

    @GetMapping("/query")
    public Result<Page<ProductionCost>> query(PageQuery query,
                                               @RequestParam(required = false) String startDate,
                                               @RequestParam(required = false) String endDate) {
        return Result.success(productionCostService.queryPage(query, startDate, endDate));
    }

    @GetMapping("/page")
    public Result<Page<ProductionCost>> page(PageQuery query,
                                             @RequestParam(required = false) String startDate,
                                             @RequestParam(required = false) String endDate) {
        return Result.success(productionCostService.page(query, startDate, endDate));
    }

    @GetMapping("/{id}")
    public Result<ProductionCost> getById(@PathVariable Long id) {
        return Result.success(productionCostService.getDetailById(id));
    }

    @PostMapping("/generate/{workOrderId}")
    public Result<ProductionCost> generateReport(@PathVariable Long workOrderId,
                                                  @RequestBody(required = false) ProductionCostDTO dto) {
        return Result.success(productionCostService.generateCostReport(workOrderId, dto));
    }

    @GetMapping("/material-details/{workOrderId}")
    public Result<List<WorkOrderMaterial>> getMaterialDetails(@PathVariable Long workOrderId) {
        return Result.success(productionCostService.getMaterialDetails(workOrderId));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        productionCostService.removeById(id);
        return Result.success();
    }

    @GetMapping("/analysis")
    public Result<Map<String, Object>> getAnalysis(@RequestParam(required = false) String startDate,
                                                   @RequestParam(required = false) String endDate) {
        return Result.success(productionCostService.getCostAnalysis(startDate, endDate));
    }

    @GetMapping("/trend")
    public Result<Map<String, Object>> getTrend(@RequestParam(required = false) String startDate,
                                                 @RequestParam(required = false) String endDate) {
        return Result.success(productionCostService.getTrendAnalysis(startDate, endDate));
    }
}
