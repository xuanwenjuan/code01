package com.evparts.controller;

import com.evparts.annotation.OperationLog;
import com.evparts.annotation.RequireRole;
import com.evparts.common.Result;
import com.evparts.service.MaterialService;
import com.evparts.service.ProductionCostService;
import com.evparts.service.WorkOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Tag(name = "生产流程管理", description = "全流程联动接口，打通原料入库、车间加工、成本统计")
@RestController
@RequestMapping("/process-flow")
public class ProcessFlowController {

    @Autowired
    private WorkOrderService workOrderService;

    @Autowired
    private MaterialService materialService;

    @Autowired
    private ProductionCostService productionCostService;

    @Operation(summary = "工单完整流程：领料+投产+完成工序+成本核算")
    @OperationLog(operation = "工单完整流程处理")
    @RequireRole({"PRODUCTION", "ADMIN"})
    @PostMapping("/full-process/{workOrderId}")
    public Result<Map<String, Object>> executeFullProcess(@PathVariable Long workOrderId) {
        Map<String, Object> result = new HashMap<>();

        workOrderService.startProduction(workOrderId);
        result.put("startProduction", "工单已投产");

        Long costId = productionCostService.autoCalculate(workOrderId);
        result.put("costCalculated", true);
        result.put("costId", costId);

        return Result.success(result);
    }

    @Operation(summary = "工单完工后自动核算成本")
    @OperationLog(operation = "工单完工自动核算成本")
    @RequireRole({"PROCESS", "ADMIN", "PRODUCTION"})
    @PostMapping("/work-order-complete/{workOrderId}")
    public Result<Long> autoCalculateAfterComplete(@PathVariable Long workOrderId) {
        Long costId = productionCostService.autoCalculate(workOrderId);
        return Result.success(costId);
    }

    @Operation(summary = "获取生产看板数据")
    @GetMapping("/dashboard")
    public Result<Map<String, Object>> getDashboard(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        Map<String, Object> dashboard = new HashMap<>();

        dashboard.put("workOrderStats", workOrderService.getStats(startDate, endDate));
        dashboard.put("costSummary", productionCostService.getCostSummary(startDate, endDate));
        dashboard.put("stockSummary", materialService.getStockSummary());

        return Result.success(dashboard);
    }

    @Operation(summary = "快捷领料并扣减库存")
    @OperationLog(operation = "快捷领料出库")
    @RequireRole({"PRODUCTION", "ADMIN", "PURCHASE"})
    @PostMapping("/quick-pick")
    public Result<Void> quickPickMaterial(
            @RequestParam Long workOrderId,
            @RequestParam Long materialId,
            @RequestParam Long stockId,
            @RequestParam BigDecimal quantity) {
        workOrderService.pickMaterial(materialId, stockId, quantity);
        return Result.success();
    }

}
