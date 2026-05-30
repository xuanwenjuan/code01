package com.fan.impeller.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.fan.impeller.common.PageQuery;
import com.fan.impeller.dto.ProductionCostDTO;
import com.fan.impeller.entity.ProductionCost;
import com.fan.impeller.entity.QualityInspection;
import com.fan.impeller.entity.WorkOrder;
import com.fan.impeller.entity.WorkOrderMaterial;
import com.fan.impeller.exception.BusinessException;
import com.fan.impeller.mapper.ProductionCostMapper;
import com.fan.impeller.mapper.QualityInspectionMapper;
import com.fan.impeller.mapper.WorkOrderMaterialMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ProductionCostService extends ServiceImpl<ProductionCostMapper, ProductionCost> {

    private final WorkOrderMaterialMapper workOrderMaterialMapper;
    private final QualityInspectionMapper qualityInspectionMapper;
    private final WorkOrderService workOrderService;

    @Cacheable(value = "costPage", key = "#query.pageNum + '-' + #query.pageSize + '-' + #startDate + '-' + #endDate", unless = "#result == null")
    public Page<ProductionCost> queryPage(PageQuery query, String startDate, String endDate) {
        return lambdaQuery()
                .ge(startDate != null, ProductionCost::getReportDate, startDate)
                .le(endDate != null, ProductionCost::getReportDate, endDate)
                .orderByDesc(ProductionCost::getCreateTime)
                .page(new Page<>(query.getPageNum(), query.getPageSize()));
    }

    public Page<ProductionCost> page(PageQuery query, String startDate, String endDate) {
        return lambdaQuery()
                .between(startDate != null && endDate != null, ProductionCost::getReportDate, startDate, endDate)
                .orderByDesc(ProductionCost::getCreateTime)
                .page(new Page<>(query.getPageNum(), query.getPageSize()));
    }

    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = {"costPage", "costReport", "costAnalysis"}, allEntries = true)
    public ProductionCost generateCostReport(Long workOrderId, ProductionCostDTO dto) {
        WorkOrder workOrder = workOrderService.getById(workOrderId);
        if (workOrder == null) {
            throw new BusinessException("工单不存在");
        }
        if (workOrder.getStatus() != 4) {
            throw new BusinessException("工单未完成，无法生成成本报表");
        }

        List<WorkOrderMaterial> materials = workOrderMaterialMapper.selectList(
                new LambdaQueryWrapper<WorkOrderMaterial>()
                        .eq(WorkOrderMaterial::getWorkOrderId, workOrderId));

        BigDecimal materialCost = materials.stream()
                .map(WorkOrderMaterial::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal moldCostRate = dto != null && dto.getMoldCostRate() != null ? dto.getMoldCostRate() : new BigDecimal("50");
        BigDecimal energyCostRate = dto != null && dto.getEnergyCostRate() != null ? dto.getEnergyCostRate() : new BigDecimal("30");
        BigDecimal laborCostRate = dto != null && dto.getLaborCostRate() != null ? dto.getLaborCostRate() : new BigDecimal("80");
        BigDecimal scrapCostRate = dto != null && dto.getScrapCostRate() != null ? dto.getScrapCostRate() : new BigDecimal("100");

        BigDecimal moldCost = calculateMoldCost(workOrder, moldCostRate);
        BigDecimal energyCost = calculateEnergyCost(workOrder, energyCostRate);
        BigDecimal laborCost = calculateLaborCost(workOrder, laborCostRate);
        BigDecimal scrapCost = calculateScrapCost(workOrderId, scrapCostRate);
        BigDecimal reworkCost = calculateReworkCost(workOrderId, materialCost);
        BigDecimal energyLossCost = calculateEnergyLossCost(workOrder);
        BigDecimal materialLossCost = calculateMaterialLossCost(materialCost);

        BigDecimal totalCost = materialCost
                .add(moldCost)
                .add(energyCost)
                .add(laborCost)
                .add(scrapCost)
                .add(reworkCost)
                .add(energyLossCost)
                .add(materialLossCost);

        BigDecimal unitCost = totalCost.divide(workOrder.getQuantity(), 2, BigDecimal.ROUND_HALF_UP);

        ProductionCost cost = new ProductionCost();
        cost.setWorkOrderId(workOrderId);
        cost.setWorkOrderNo(workOrder.getOrderNo());
        cost.setMaterialCost(materialCost);
        cost.setMoldCost(moldCost);
        cost.setEnergyCost(energyCost);
        cost.setLaborCost(laborCost);
        cost.setScrapCost(scrapCost);
        cost.setTotalCost(totalCost);
        cost.setUnitCost(unitCost);
        cost.setQuantity(workOrder.getQuantity());
        cost.setReportDate(LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));

        save(cost);
        return cost;
    }

    private BigDecimal calculateMoldCost(WorkOrder workOrder, BigDecimal rate) {
        BigDecimal baseCost = workOrder.getQuantity().multiply(rate);
        return baseCost.multiply(new BigDecimal("1.1"));
    }

    private BigDecimal calculateEnergyCost(WorkOrder workOrder, BigDecimal rate) {
        BigDecimal baseCost = workOrder.getQuantity().multiply(rate);
        return baseCost.multiply(new BigDecimal("1.05"));
    }

    private BigDecimal calculateLaborCost(WorkOrder workOrder, BigDecimal rate) {
        return workOrder.getQuantity().multiply(rate);
    }

    private BigDecimal calculateScrapCost(Long workOrderId, BigDecimal rate) {
        List<QualityInspection> inspections = qualityInspectionMapper.selectList(
                new LambdaQueryWrapper<QualityInspection>()
                        .eq(QualityInspection::getWorkOrderId, workOrderId));

        BigDecimal totalScrapQuantity = inspections.stream()
                .map(QualityInspection::getScrapQuantity)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return totalScrapQuantity.multiply(rate);
    }

    private BigDecimal calculateReworkCost(Long workOrderId, BigDecimal materialCost) {
        List<QualityInspection> inspections = qualityInspectionMapper.selectList(
                new LambdaQueryWrapper<QualityInspection>()
                        .eq(QualityInspection::getWorkOrderId, workOrderId));

        BigDecimal totalReworkQuantity = inspections.stream()
                .map(QualityInspection::getReworkQuantity)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal reworkCostRate = new BigDecimal("0.3");
        return materialCost.multiply(reworkCostRate).multiply(totalReworkQuantity);
    }

    private BigDecimal calculateEnergyLossCost(WorkOrder workOrder) {
        if (workOrder.getActualStartTime() != null && workOrder.getActualEndTime() != null) {
            long hours = java.time.Duration.between(workOrder.getActualStartTime(), workOrder.getActualEndTime()).toHours();
            BigDecimal lossRate = new BigDecimal("5");
            return lossRate.multiply(new BigDecimal(hours));
        }
        return BigDecimal.ZERO;
    }

    private BigDecimal calculateMaterialLossCost(BigDecimal materialCost) {
        BigDecimal lossRate = new BigDecimal("0.02");
        return materialCost.multiply(lossRate);
    }

    @Cacheable(value = "materialDetails", key = "#workOrderId", unless = "#result == null")
    public List<WorkOrderMaterial> getMaterialDetails(Long workOrderId) {
        return workOrderMaterialMapper.selectList(
                new LambdaQueryWrapper<WorkOrderMaterial>()
                        .eq(WorkOrderMaterial::getWorkOrderId, workOrderId));
    }

    @Cacheable(value = "costAnalysis", key = "#startDate + '-' + #endDate", unless = "#result == null")
    public Map<String, Object> getCostAnalysis(String startDate, String endDate) {
        Map<String, Object> analysis = new HashMap<>();

        List<ProductionCost> costs = list(new LambdaQueryWrapper<ProductionCost>()
                .ge(startDate != null, ProductionCost::getReportDate, startDate)
                .le(endDate != null, ProductionCost::getReportDate, endDate));

        BigDecimal totalMaterialCost = BigDecimal.ZERO;
        BigDecimal totalMoldCost = BigDecimal.ZERO;
        BigDecimal totalEnergyCost = BigDecimal.ZERO;
        BigDecimal totalLaborCost = BigDecimal.ZERO;
        BigDecimal totalScrapCost = BigDecimal.ZERO;
        BigDecimal totalAllCost = BigDecimal.ZERO;
        BigDecimal totalQuantity = BigDecimal.ZERO;

        for (ProductionCost cost : costs) {
            totalMaterialCost = totalMaterialCost.add(cost.getMaterialCost());
            totalMoldCost = totalMoldCost.add(cost.getMoldCost());
            totalEnergyCost = totalEnergyCost.add(cost.getEnergyCost());
            totalLaborCost = totalLaborCost.add(cost.getLaborCost());
            totalScrapCost = totalScrapCost.add(cost.getScrapCost());
            totalAllCost = totalAllCost.add(cost.getTotalCost());
            totalQuantity = totalQuantity.add(cost.getQuantity());
        }

        analysis.put("totalMaterialCost", totalMaterialCost);
        analysis.put("totalMoldCost", totalMoldCost);
        analysis.put("totalEnergyCost", totalEnergyCost);
        analysis.put("totalLaborCost", totalLaborCost);
        analysis.put("totalScrapCost", totalScrapCost);
        analysis.put("totalAllCost", totalAllCost);
        analysis.put("totalQuantity", totalQuantity);

        if (totalAllCost.compareTo(BigDecimal.ZERO) > 0) {
            Map<String, String> proportions = new HashMap<>();
            proportions.put("materialCostProportion",
                    totalMaterialCost.multiply(new BigDecimal("100")).divide(totalAllCost, 2, BigDecimal.ROUND_HALF_UP) + "%");
            proportions.put("moldCostProportion",
                    totalMoldCost.multiply(new BigDecimal("100")).divide(totalAllCost, 2, BigDecimal.ROUND_HALF_UP) + "%");
            proportions.put("energyCostProportion",
                    totalEnergyCost.multiply(new BigDecimal("100")).divide(totalAllCost, 2, BigDecimal.ROUND_HALF_UP) + "%");
            proportions.put("laborCostProportion",
                    totalLaborCost.multiply(new BigDecimal("100")).divide(totalAllCost, 2, BigDecimal.ROUND_HALF_UP) + "%");
            proportions.put("scrapCostProportion",
                    totalScrapCost.multiply(new BigDecimal("100")).divide(totalAllCost, 2, BigDecimal.ROUND_HALF_UP) + "%");
            analysis.put("proportions", proportions);
        }

        if (totalQuantity.compareTo(BigDecimal.ZERO) > 0) {
            analysis.put("avgUnitCost", totalAllCost.divide(totalQuantity, 2, BigDecimal.ROUND_HALF_UP));
        }

        analysis.put("totalCount", costs.size());

        return analysis;
    }

    public Map<String, Object> getTrendAnalysis(String startDate, String endDate) {
        Map<String, Object> trend = new HashMap<>();

        List<ProductionCost> costs = list(new LambdaQueryWrapper<ProductionCost>()
                .ge(startDate != null, ProductionCost::getReportDate, startDate)
                .le(endDate != null, ProductionCost::getReportDate, endDate)
                .orderByAsc(ProductionCost::getReportDate));

        Map<String, BigDecimal> dateCostMap = new HashMap<>();
        Map<String, BigDecimal> dateQuantityMap = new HashMap<>();

        for (ProductionCost cost : costs) {
            String date = cost.getReportDate();
            dateCostMap.merge(date, cost.getTotalCost(), BigDecimal::add);
            dateQuantityMap.merge(date, cost.getQuantity(), BigDecimal::add);
        }

        trend.put("dateCostMap", dateCostMap);
        trend.put("dateQuantityMap", dateQuantityMap);

        return trend;
    }

    @Cacheable(value = "costReport", key = "#id", unless = "#result == null")
    public ProductionCost getDetailById(Long id) {
        return getById(id);
    }
}
