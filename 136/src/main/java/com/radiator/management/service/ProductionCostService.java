package com.radiator.management.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.radiator.management.entity.MonthlyReport;
import com.radiator.management.entity.ProductionCost;
import com.radiator.management.entity.WorkOrderMaterial;
import com.radiator.management.mapper.MonthlyReportMapper;
import com.radiator.management.mapper.ProductionCostMapper;
import com.radiator.management.mapper.WorkOrderMaterialMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductionCostService {

    private final ProductionCostMapper costMapper;
    private final MonthlyReportMapper monthlyReportMapper;
    private final WorkOrderMaterialMapper workOrderMaterialMapper;

    public void calculateCost(Long workOrderId) {
        List<WorkOrderMaterial> materials = workOrderMaterialMapper.selectList(
            new LambdaQueryWrapper<WorkOrderMaterial>()
                .eq(WorkOrderMaterial::getWorkOrderId, workOrderId)
        );

        BigDecimal materialCost = materials.stream()
                .map(WorkOrderMaterial::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        String month = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));

        ProductionCost cost = new ProductionCost();
        cost.setWorkOrderId(workOrderId);
        cost.setMaterialCost(materialCost);
        cost.setEquipmentCost(BigDecimal.ZERO);
        cost.setLaborCost(BigDecimal.ZERO);
        cost.setConsumableCost(BigDecimal.ZERO);
        cost.setScrapCost(BigDecimal.ZERO);
        cost.setTotalCost(materialCost);
        cost.setMonth(month);
        
        costMapper.insert(cost);
    }

    public void generateMonthlyReport(String month) {
        List<ProductionCost> costs = costMapper.selectList(
            new LambdaQueryWrapper<ProductionCost>()
                .eq(ProductionCost::getMonth, month)
        );

        BigDecimal totalMaterialCost = BigDecimal.ZERO;
        BigDecimal totalEquipmentCost = BigDecimal.ZERO;
        BigDecimal totalLaborCost = BigDecimal.ZERO;
        BigDecimal totalConsumableCost = BigDecimal.ZERO;
        BigDecimal totalScrapCost = BigDecimal.ZERO;

        for (ProductionCost cost : costs) {
            totalMaterialCost = totalMaterialCost.add(cost.getMaterialCost());
            totalEquipmentCost = totalEquipmentCost.add(cost.getEquipmentCost());
            totalLaborCost = totalLaborCost.add(cost.getLaborCost());
            totalConsumableCost = totalConsumableCost.add(cost.getConsumableCost());
            totalScrapCost = totalScrapCost.add(cost.getScrapCost());
        }

        BigDecimal totalCost = totalMaterialCost
                .add(totalEquipmentCost)
                .add(totalLaborCost)
                .add(totalConsumableCost)
                .add(totalScrapCost);

        MonthlyReport report = new MonthlyReport();
        report.setReportMonth(month);
        report.setTotalMaterialCost(totalMaterialCost);
        report.setTotalEquipmentCost(totalEquipmentCost);
        report.setTotalLaborCost(totalLaborCost);
        report.setTotalConsumableCost(totalConsumableCost);
        report.setTotalScrapCost(totalScrapCost);
        report.setTotalCost(totalCost);
        report.setTotalProduction(costs.size());
        report.setTotalDefective(0);

        MonthlyReport existing = monthlyReportMapper.selectOne(
            new LambdaQueryWrapper<MonthlyReport>()
                .eq(MonthlyReport::getReportMonth, month)
        );

        if (existing != null) {
            report.setId(existing.getId());
            monthlyReportMapper.updateById(report);
        } else {
            monthlyReportMapper.insert(report);
        }
    }

    public List<MonthlyReport> getMonthlyReports() {
        return monthlyReportMapper.selectList(
            new LambdaQueryWrapper<MonthlyReport>()
                .orderByDesc(MonthlyReport::getReportMonth)
        );
    }

    public MonthlyReport getReportByMonth(String month) {
        return monthlyReportMapper.selectOne(
            new LambdaQueryWrapper<MonthlyReport>()
                .eq(MonthlyReport::getReportMonth, month)
        );
    }

    public void confirmReport(Long id) {
        MonthlyReport report = monthlyReportMapper.selectById(id);
        if (report != null) {
            report.setStatus(1);
            monthlyReportMapper.updateById(report);
        }
    }
}