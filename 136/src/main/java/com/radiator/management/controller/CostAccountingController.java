package com.radiator.management.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.radiator.management.annotation.RequiresRole;
import com.radiator.management.common.Result;
import com.radiator.management.constant.RoleConstants;
import com.radiator.management.entity.*;
import com.radiator.management.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cost-accounting")
public class CostAccountingController {

    @Autowired
    private ProductionWorkOrderService workOrderService;

    @Autowired
    private WorkOrderMaterialService workOrderMaterialService;

    @Autowired
    private ProductionReportService productionReportService;

    @Autowired
    private ProductionCostService productionCostService;

    @Autowired
    private MonthlyReportService monthlyReportService;

    @Autowired
    private MaterialInventoryService materialInventoryService;

    @Autowired
    private FinishedStockService finishedStockService;

    @PostMapping("/calculate-work-order-cost/{workOrderId}")
    @RequiresRole({RoleConstants.ADMIN, RoleConstants.PRODUCTION_LEADER})
    @Transactional(rollbackFor = Exception.class)
    public Result calculateWorkOrderCost(@PathVariable Long workOrderId) {
        ProductionWorkOrder workOrder = workOrderService.getById(workOrderId);
        if (workOrder == null) {
            return Result.error("工单不存在");
        }

        List<WorkOrderMaterial> materials = workOrderMaterialService.list(
                new LambdaQueryWrapper<WorkOrderMaterial>()
                        .eq(WorkOrderMaterial::getWorkOrderId, workOrderId)
        );
        BigDecimal materialCost = materials.stream()
                .map(WorkOrderMaterial::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<ProductionReport> reports = productionReportService.list(
                new LambdaQueryWrapper<ProductionReport>()
                        .eq(ProductionReport::getWorkOrderId, workOrderId)
        );
        BigDecimal laborCost = reports.stream()
                .map(ProductionReport::getLaborCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal equipmentCost = reports.stream()
                .map(ProductionReport::getEquipmentCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal scrapCost = calculateScrapCost(workOrderId, reports);
        BigDecimal consumableCost = calculateConsumableCost(workOrderId, workOrder.getQuantity());

        BigDecimal totalCost = materialCost
                .add(laborCost)
                .add(equipmentCost)
                .add(scrapCost)
                .add(consumableCost);

        ProductionCost productionCost = new ProductionCost();
        productionCost.setWorkOrderId(workOrderId);
        productionCost.setMaterialCost(materialCost);
        productionCost.setLaborCost(laborCost);
        productionCost.setEquipmentCost(equipmentCost);
        productionCost.setScrapCost(scrapCost);
        productionCost.setConsumableCost(consumableCost);
        productionCost.setTotalCost(totalCost);
        productionCost.setMonth(YearMonth.now().toString());
        productionCostService.save(productionCost);

        FinishedStock finishedStock = finishedStockService.getOne(
                new LambdaQueryWrapper<FinishedStock>()
                        .eq(FinishedStock::getWorkOrderId, workOrderId)
        );
        if (finishedStock != null && finishedStock.getQuantity() > 0) {
            BigDecimal unitCost = totalCost.divide(
                    BigDecimal.valueOf(finishedStock.getQuantity()),
                    2,
                    RoundingMode.HALF_UP
            );
            finishedStock.setUnitCost(unitCost);
            finishedStock.setTotalCost(totalCost);
            finishedStockService.updateById(finishedStock);
        }

        Map<String, BigDecimal> result = new HashMap<>();
        result.put("materialCost", materialCost);
        result.put("laborCost", laborCost);
        result.put("equipmentCost", equipmentCost);
        result.put("scrapCost", scrapCost);
        result.put("consumableCost", consumableCost);
        result.put("totalCost", totalCost);

        return Result.success(result);
    }

    private BigDecimal calculateScrapCost(Long workOrderId, List<ProductionReport> reports) {
        int totalDefective = reports.stream()
                .mapToInt(ProductionReport::getDefectiveQuantity)
                .sum();

        if (totalDefective == 0) {
            return BigDecimal.ZERO;
        }

        List<WorkOrderMaterial> materials = workOrderMaterialService.list(
                new LambdaQueryWrapper<WorkOrderMaterial>()
                        .eq(WorkOrderMaterial::getWorkOrderId, workOrderId)
        );
        BigDecimal totalMaterialCost = materials.stream()
                .map(WorkOrderMaterial::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        ProductionWorkOrder workOrder = workOrderService.getById(workOrderId);
        if (workOrder == null || workOrder.getQuantity() == 0) {
            return BigDecimal.ZERO;
        }

        BigDecimal unitMaterialCost = totalMaterialCost.divide(
                BigDecimal.valueOf(workOrder.getQuantity()),
                2,
                RoundingMode.HALF_UP
        );

        return unitMaterialCost.multiply(BigDecimal.valueOf(totalDefective));
    }

    private BigDecimal calculateConsumableCost(Long workOrderId, int quantity) {
        BigDecimal perUnitCost = new BigDecimal("5.00");
        return perUnitCost.multiply(BigDecimal.valueOf(quantity));
    }

    @PostMapping("/generate-monthly-report/{yearMonth}")
    @RequiresRole({RoleConstants.ADMIN})
    @Transactional(rollbackFor = Exception.class)
    public Result generateMonthlyReport(@PathVariable String yearMonth) {
        MonthlyReport existing = monthlyReportService.getOne(
                new LambdaQueryWrapper<MonthlyReport>()
                        .eq(MonthlyReport::getReportMonth, yearMonth)
        );
        if (existing != null) {
            return Result.error("该月份报表已存在");
        }

        List<ProductionCost> costs = productionCostService.list(
                new LambdaQueryWrapper<ProductionCost>()
                        .eq(ProductionCost::getMonth, yearMonth)
        );

        BigDecimal totalMaterialCost = costs.stream()
                .map(ProductionCost::getMaterialCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalLaborCost = costs.stream()
                .map(ProductionCost::getLaborCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalEquipmentCost = costs.stream()
                .map(ProductionCost::getEquipmentCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalConsumableCost = costs.stream()
                .map(ProductionCost::getConsumableCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalScrapCost = costs.stream()
                .map(ProductionCost::getScrapCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalCost = costs.stream()
                .map(ProductionCost::getTotalCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int totalProduction = 0;
        int totalDefective = 0;
        for (ProductionCost cost : costs) {
            List<ProductionReport> reports = productionReportService.list(
                    new LambdaQueryWrapper<ProductionReport>()
                            .eq(ProductionReport::getWorkOrderId, cost.getWorkOrderId())
            );
            totalProduction += reports.stream()
                    .mapToInt(ProductionReport::getReportQuantity)
                    .sum();
            totalDefective += reports.stream()
                    .mapToInt(ProductionReport::getDefectiveQuantity)
                    .sum();
        }

        MonthlyReport report = new MonthlyReport();
        report.setReportMonth(yearMonth);
        report.setTotalMaterialCost(totalMaterialCost);
        report.setTotalLaborCost(totalLaborCost);
        report.setTotalEquipmentCost(totalEquipmentCost);
        report.setTotalConsumableCost(totalConsumableCost);
        report.setTotalScrapCost(totalScrapCost);
        report.setTotalCost(totalCost);
        report.setTotalProduction(totalProduction);
        report.setTotalDefective(totalDefective);
        report.setStatus(1);
        monthlyReportService.save(report);

        return Result.success(report.getId());
    }

    @GetMapping("/monthly-report/{yearMonth}")
    @RequiresRole({RoleConstants.ADMIN})
    public Result getMonthlyReport(@PathVariable String yearMonth) {
        MonthlyReport report = monthlyReportService.getOne(
                new LambdaQueryWrapper<MonthlyReport>()
                        .eq(MonthlyReport::getReportMonth, yearMonth)
        );
        if (report == null) {
            return Result.error("报表不存在");
        }
        return Result.success(report);
    }

    @GetMapping("/work-order-cost-list")
    @RequiresRole({RoleConstants.ADMIN, RoleConstants.PRODUCTION_LEADER})
    public Result getWorkOrderCostList(@RequestParam(required = false) String month) {
        LambdaQueryWrapper<ProductionCost> wrapper = new LambdaQueryWrapper<>();
        if (month != null && !month.isEmpty()) {
            wrapper.eq(ProductionCost::getMonth, month);
        }
        wrapper.orderByDesc(ProductionCost::getCreateTime);
        List<ProductionCost> list = productionCostService.list(wrapper);
        return Result.success(list);
    }

    @PostMapping("/weighted-average-material-cost")
    @RequiresRole({RoleConstants.ADMIN})
    @Transactional(rollbackFor = Exception.class)
    public Result calculateWeightedAverageMaterialCost() {
        List<MaterialInventory> materials = materialInventoryService.list();
        Map<String, Object> result = new HashMap<>();

        for (MaterialInventory material : materials) {
            if (material.getQuantity().compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal totalValue = material.getUnitPrice().multiply(material.getQuantity());
                result.put(material.getMaterialCode(), Map.of(
                        "materialName", material.getMaterialName(),
                        "quantity", material.getQuantity(),
                        "unitPrice", material.getUnitPrice(),
                        "totalValue", totalValue
                ));
            }
        }

        return Result.success(result);
    }
}
