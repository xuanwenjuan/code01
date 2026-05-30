package com.gear.mfg.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.gear.mfg.entity.*;
import com.gear.mfg.mapper.ProductionCostMapper;
import com.gear.mfg.mapper.ProductionReportMapper;
import com.gear.mfg.mapper.QualityCheckMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductionCostService extends ServiceImpl<ProductionCostMapper, ProductionCost> {

    private final ProductionReportMapper productionReportMapper;
    private final QualityCheckMapper qualityCheckMapper;
    private final MaterialStockService materialStockService;

    @Transactional(rollbackFor = Exception.class)
    public ProductionCost calculateProductionCost(Long orderId, String gearModel, BigDecimal productionQuantity) {
        ProductionCost cost = new ProductionCost();
        cost.setOrderId(orderId);
        cost.setGearModel(gearModel);
        cost.setProductionQuantity(productionQuantity);
        cost.setCostDate(LocalDateTime.now());

        BigDecimal materialCost = calculateMaterialCost(orderId, productionQuantity);
        BigDecimal laborCost = calculateLaborCost(orderId);
        BigDecimal energyCost = calculateEnergyCost(orderId);
        BigDecimal toolCost = calculateToolCost(orderId);
        BigDecimal scrapCost = calculateScrapCost(orderId);

        cost.setMaterialCost(materialCost);
        cost.setLaborCost(laborCost);
        cost.setEnergyCost(energyCost);
        cost.setToolCost(toolCost);
        cost.setScrapCost(scrapCost);

        BigDecimal totalCost = materialCost.add(laborCost).add(energyCost).add(toolCost).add(scrapCost);
        cost.setTotalCost(totalCost);

        if (productionQuantity.compareTo(BigDecimal.ZERO) > 0) {
            cost.setUnitCost(totalCost.divide(productionQuantity, 4, RoundingMode.HALF_UP));
        }

        cost.setStatus(1);
        save(cost);

        return cost;
    }

    private BigDecimal calculateMaterialCost(Long orderId, BigDecimal productionQuantity) {
        BigDecimal unitMaterialCost = new BigDecimal("500");
        return unitMaterialCost.multiply(productionQuantity);
    }

    private BigDecimal calculateLaborCost(Long orderId) {
        LambdaQueryWrapper<ProductionReport> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProductionReport::getOrderId, orderId);
        List<ProductionReport> reports = productionReportMapper.selectList(wrapper);

        BigDecimal totalHours = reports.stream()
                .map(r -> r.getActualHours() != null ? r.getActualHours() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal hourlyRate = new BigDecimal("80");
        return totalHours.multiply(hourlyRate);
    }

    private BigDecimal calculateEnergyCost(Long orderId) {
        LambdaQueryWrapper<ProductionReport> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProductionReport::getOrderId, orderId);
        List<ProductionReport> reports = productionReportMapper.selectList(wrapper);

        BigDecimal totalHours = reports.stream()
                .map(r -> r.getActualHours() != null ? r.getActualHours() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal hourlyEnergyCost = new BigDecimal("50");
        return totalHours.multiply(hourlyEnergyCost);
    }

    private BigDecimal calculateToolCost(Long orderId) {
        LambdaQueryWrapper<QualityCheck> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(QualityCheck::getOrderId, orderId);
        List<QualityCheck> checks = qualityCheckMapper.selectList(wrapper);

        BigDecimal totalBadQuantity = checks.stream()
                .map(q -> q.getBadQuantity() != null ? q.getBadQuantity() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal toolCostPerBadUnit = new BigDecimal("100");
        return totalBadQuantity.multiply(toolCostPerBadUnit);
    }

    private BigDecimal calculateScrapCost(Long orderId) {
        LambdaQueryWrapper<QualityCheck> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(QualityCheck::getOrderId, orderId);
        wrapper.eq(QualityCheck::getCheckResult, "FAIL");
        List<QualityCheck> checks = qualityCheckMapper.selectList(wrapper);

        BigDecimal totalScrapQuantity = checks.stream()
                .map(q -> q.getBadQuantity() != null ? q.getBadQuantity() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal scrapCostPerUnit = new BigDecimal("500");
        return totalScrapQuantity.multiply(scrapCostPerUnit);
    }
}
