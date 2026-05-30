package com.spring.manufacturing.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.spring.manufacturing.annotation.OperationLog;
import com.spring.manufacturing.annotation.RequiresRole;
import com.spring.manufacturing.common.Result;
import com.spring.manufacturing.entity.ProductionCost;
import com.spring.manufacturing.entity.ProductionCostRecord;
import com.spring.manufacturing.service.ProductionCostService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cost")
@RequiredArgsConstructor
public class ProductionCostController {

    private final ProductionCostService productionCostService;

    @GetMapping("/page")
    @RequiresRole({"ADMIN", "LEADER"})
    public Result<IPage<ProductionCost>> getCostReportPage(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String month,
            @RequestParam(required = false) Long categoryId) {
        IPage<ProductionCost> pageResult = productionCostService.getCostReportPage(page, size, month, categoryId);
        return Result.success(pageResult);
    }

    @GetMapping("/summary")
    @RequiresRole({"ADMIN", "LEADER"})
    public Result<List<ProductionCost>> getCostSummaryByCategory(@RequestParam String month) {
        List<ProductionCost> summary = productionCostService.getCostSummaryByCategory(month);
        return Result.success(summary);
    }

    @GetMapping("/{id}")
    @RequiresRole({"ADMIN", "LEADER"})
    public Result<ProductionCost> getCostById(@PathVariable Long id) {
        ProductionCost cost = productionCostService.getById(id);
        return Result.success(cost);
    }

    @PostMapping("/generate-report")
    @RequiresRole({"ADMIN", "LEADER"})
    @OperationLog(module = "成本核算", type = "生成报表", description = "生成月度成本报表")
    public Result<Void> generateMonthlyReport(@RequestBody Map<String, String> params) {
        String month = params.get("month");
        productionCostService.generateMonthlyReport(month);
        return Result.success("报表生成成功", null);
    }

    @PutMapping("/update")
    @RequiresRole({"ADMIN"})
    @OperationLog(module = "成本核算", type = "调整成本", description = "调整成本明细")
    public Result<Void> updateCostItem(@RequestBody Map<String, Object> params) {
        Long id = Long.valueOf(params.get("id").toString());
        String costType = (String) params.get("costType");
        BigDecimal amount = new BigDecimal(params.get("amount").toString());
        productionCostService.updateCostItem(id, costType, amount);
        return Result.success("更新成功", null);
    }
}