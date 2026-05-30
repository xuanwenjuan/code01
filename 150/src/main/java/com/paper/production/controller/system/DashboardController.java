package com.paper.production.controller.system;

import com.paper.production.common.Result;
import com.paper.production.service.cost.ProductionCostService;
import com.paper.production.service.material.MaterialService;
import com.paper.production.service.workorder.WorkOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@Tag(name = "数据看板")
@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    @Resource
    private MaterialService materialService;

    @Resource
    private WorkOrderService workOrderService;

    @Resource
    private ProductionCostService productionCostService;

    @Operation(summary = "获取首页综合统计数据")
    @GetMapping("/overview")
    public Result<Map<String, Object>> getOverview() {
        Map<String, Object> result = new HashMap<>();

        result.put("material", materialService.getMaterialStatistics());
        result.put("workOrder", workOrderService.getWorkOrderStatistics());
        result.put("efficiency", workOrderService.getProductionEfficiency());
        result.put("daily", workOrderService.getDailyStatistics(null));

        return Result.success(result);
    }

    @Operation(summary = "获取仓储看板数据")
    @GetMapping("/material")
    public Result<Map<String, Object>> getMaterialDashboard() {
        Map<String, Object> result = new HashMap<>();

        result.put("statistics", materialService.getMaterialStatistics());
        result.put("warningMaterials", materialService.getWarningMaterials());
        result.put("moistureExpiring", materialService.getMoistureProofExpiring());
        result.put("inboundToday", materialService.getInboundStatistics(LocalDate.now(), LocalDate.now()));
        result.put("outboundToday", materialService.getOutboundStatistics(LocalDate.now(), LocalDate.now()));

        return Result.success(result);
    }

    @Operation(summary = "获取生产看板数据")
    @GetMapping("/production")
    public Result<Map<String, Object>> getProductionDashboard() {
        Map<String, Object> result = new HashMap<>();

        result.put("statistics", workOrderService.getWorkOrderStatistics());
        result.put("pendingOrders", workOrderService.getPendingOrders());
        result.put("processingOrders", workOrderService.getProcessingOrders());
        result.put("todayStatistics", workOrderService.getDailyStatistics(null));
        result.put("efficiency", workOrderService.getProductionEfficiency());

        return Result.success(result);
    }

    @Operation(summary = "获取成本看板数据")
    @GetMapping("/cost")
    public Result<Map<String, Object>> getCostDashboard() {
        Map<String, Object> result = new HashMap<>();

        result.put("monthlyReports", productionCostService.getMonthlyReports());

        return Result.success(result);
    }

    @Operation(summary = "获取指定日期范围的统计数据")
    @GetMapping("/range")
    public Result<Map<String, Object>> getRangeStatistics(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        Map<String, Object> result = new HashMap<>();

        result.put("inbound", materialService.getInboundStatistics(startDate, endDate));
        result.put("outbound", materialService.getOutboundStatistics(startDate, endDate));
        result.put("finishedOrders", workOrderService.getFinishedOrders(startDate, endDate));

        return Result.success(result);
    }
}
