package com.household.management.service;

import cn.hutool.core.date.DateUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.household.management.common.exception.BusinessException;
import com.household.management.entity.CostStatistics;
import com.household.management.entity.ProductCost;
import com.household.management.entity.MonthlyProductionSalesReport;
import com.household.management.mapper.CostStatisticsMapper;
import com.household.management.mapper.ProductCostMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@Service
public class CostStatisticsService {

    private final CostStatisticsMapper costStatisticsMapper;
    private final ProductCostMapper productCostMapper;

    public CostStatisticsService(CostStatisticsMapper costStatisticsMapper, ProductCostMapper productCostMapper) {
        this.costStatisticsMapper = costStatisticsMapper;
        this.productCostMapper = productCostMapper;
    }

    public List<CostStatistics> list(String startMonth, String endMonth) {
        LambdaQueryWrapper<CostStatistics> wrapper = new LambdaQueryWrapper<>();
        if (startMonth != null && !startMonth.isEmpty()) {
            wrapper.ge(CostStatistics::getStatisticsMonth, startMonth);
        }
        if (endMonth != null && !endMonth.isEmpty()) {
            wrapper.le(CostStatistics::getStatisticsMonth, endMonth);
        }
        wrapper.orderByDesc(CostStatistics::getStatisticsMonth);
        return costStatisticsMapper.selectList(wrapper);
    }

    public CostStatistics getById(Long id) {
        CostStatistics statistics = costStatisticsMapper.selectById(id);
        if (statistics == null) {
            throw new BusinessException("数据不存在");
        }
        return statistics;
    }

    @Transactional(rollbackFor = Exception.class)
    public CostStatistics generateMonthlyStatistics(String month) {
        if (month == null || month.isEmpty()) {
            month = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
        }

        LambdaQueryWrapper<CostStatistics> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CostStatistics::getStatisticsMonth, month);
        CostStatistics existing = costStatisticsMapper.selectOne(wrapper);

        List<ProductCost> productCosts = productCostMapper.selectProductCostByConditions(month, null);

        BigDecimal materialCost = productCosts.stream()
                .map(pc -> pc.getActualMaterialCost() != null ? pc.getActualMaterialCost() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal laborCost = productCosts.stream()
                .map(pc -> pc.getActualLaborCost() != null ? pc.getActualLaborCost() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal equipmentCost = productCosts.stream()
                .map(pc -> pc.getActualEquipmentCost() != null ? pc.getActualEquipmentCost() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal packagingCost = productCosts.stream()
                .map(pc -> pc.getActualPackagingCost() != null ? pc.getActualPackagingCost() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal defectiveCost = productCosts.stream()
                .map(pc -> pc.getDefectiveScrapCost() != null ? pc.getDefectiveScrapCost() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal otherCost = productCosts.stream()
                .map(pc -> pc.getOtherCost() != null ? pc.getOtherCost() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal salesRevenue = costStatisticsMapper.calculateSalesRevenue(month);

        if (materialCost.compareTo(BigDecimal.ZERO) == 0) {
            materialCost = costStatisticsMapper.calculateMaterialCost(month);
            equipmentCost = materialCost.multiply(new BigDecimal("0.05"));
            laborCost = materialCost.multiply(new BigDecimal("0.20"));
            packagingCost = materialCost.multiply(new BigDecimal("0.08"));
            defectiveCost = materialCost.multiply(new BigDecimal("0.03"));
            otherCost = materialCost.multiply(new BigDecimal("0.04"));
        }

        BigDecimal totalCost = materialCost.add(equipmentCost).add(laborCost)
                .add(packagingCost).add(defectiveCost).add(otherCost);
        BigDecimal grossProfit = salesRevenue.subtract(totalCost);
        BigDecimal grossMargin = salesRevenue.compareTo(BigDecimal.ZERO) > 0
                ? grossProfit.divide(salesRevenue, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100"))
                : BigDecimal.ZERO;

        CostStatistics statistics;
        if (existing != null) {
            statistics = existing;
        } else {
            statistics = new CostStatistics();
            statistics.setStatisticsMonth(month);
        }

        statistics.setMaterialCost(materialCost);
        statistics.setEquipmentCost(equipmentCost);
        statistics.setLaborCost(laborCost);
        statistics.setPackagingCost(packagingCost);
        statistics.setDefectiveCost(defectiveCost);
        statistics.setOtherCost(otherCost);
        statistics.setTotalCost(totalCost);
        statistics.setSalesRevenue(salesRevenue);
        statistics.setGrossProfit(grossProfit);
        statistics.setGrossMargin(grossMargin);

        if (existing != null) {
            costStatisticsMapper.updateById(statistics);
        } else {
            costStatisticsMapper.insert(statistics);
        }

        log.info("生成月度成本统计：{}，基于{}个工单成本数据", month, productCosts.size());
        return statistics;
    }

    @Transactional(rollbackFor = Exception.class)
    public void addCostRecord(CostStatistics statistics) {
        LambdaQueryWrapper<CostStatistics> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CostStatistics::getStatisticsMonth, statistics.getStatisticsMonth());
        if (costStatisticsMapper.selectCount(wrapper) > 0) {
            throw new BusinessException("该月份成本统计已存在");
        }

        BigDecimal totalCost = statistics.getMaterialCost()
                .add(statistics.getEquipmentCost())
                .add(statistics.getLaborCost())
                .add(statistics.getPackagingCost())
                .add(statistics.getDefectiveCost())
                .add(statistics.getOtherCost());
        statistics.setTotalCost(totalCost);

        BigDecimal grossProfit = statistics.getSalesRevenue().subtract(totalCost);
        statistics.setGrossProfit(grossProfit);

        BigDecimal grossMargin = statistics.getSalesRevenue().compareTo(BigDecimal.ZERO) > 0
                ? grossProfit.divide(statistics.getSalesRevenue(), 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100"))
                : BigDecimal.ZERO;
        statistics.setGrossMargin(grossMargin);

        costStatisticsMapper.insert(statistics);
        log.info("新增成本统计：{}", statistics.getStatisticsMonth());
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateCostRecord(CostStatistics statistics) {
        CostStatistics existing = costStatisticsMapper.selectById(statistics.getId());
        if (existing == null) {
            throw new BusinessException("数据不存在");
        }

        BigDecimal totalCost = statistics.getMaterialCost()
                .add(statistics.getEquipmentCost())
                .add(statistics.getLaborCost())
                .add(statistics.getPackagingCost())
                .add(statistics.getDefectiveCost())
                .add(statistics.getOtherCost());
        statistics.setTotalCost(totalCost);

        BigDecimal grossProfit = statistics.getSalesRevenue().subtract(totalCost);
        statistics.setGrossProfit(grossProfit);

        BigDecimal grossMargin = statistics.getSalesRevenue().compareTo(BigDecimal.ZERO) > 0
                ? grossProfit.divide(statistics.getSalesRevenue(), 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100"))
                : BigDecimal.ZERO;
        statistics.setGrossMargin(grossMargin);

        costStatisticsMapper.updateById(statistics);
        log.info("更新成本统计：{}", statistics.getStatisticsMonth());
    }

    public void delete(Long id) {
        costStatisticsMapper.deleteById(id);
    }
}
