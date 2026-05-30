package com.battery.shell.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.battery.shell.annotation.Log;
import com.battery.shell.entity.CostDetail;
import com.battery.shell.entity.CostStatistics;
import com.battery.shell.entity.ProductionOrder;
import com.battery.shell.mapper.CostDetailMapper;
import com.battery.shell.mapper.CostStatisticsMapper;
import com.battery.shell.mapper.ProductionOrderMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CostService {

    private final CostStatisticsMapper costStatisticsMapper;
    private final CostDetailMapper costDetailMapper;
    private final ProductionOrderMapper productionOrderMapper;

    private static final BigDecimal MOLD_COST_PER_UNIT = new BigDecimal("2.5");
    private static final BigDecimal ENERGY_COST_PER_UNIT = new BigDecimal("1.2");
    private static final BigDecimal LABOR_COST_PER_UNIT = new BigDecimal("3.0");
    private static final BigDecimal DEFECTIVE_COST_RATE = new BigDecimal("0.8");

    @Transactional(rollbackFor = Exception.class)
    @Log(value = "生成月度成本报表", module = "成本统计")
    public void generateMonthlyReport(LocalDate date) {
        YearMonth yearMonth = YearMonth.from(date);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();

        List<ProductionOrder> finishedOrders = productionOrderMapper.selectList(
                new LambdaQueryWrapper<ProductionOrder>()
                        .eq(ProductionOrder::getStatus, "FINISHED")
                        .between(ProductionOrder::getActualEndTime,
                                startDate.atStartOfDay(),
                                endDate.atTime(23, 59, 59))
        );

        Map<Long, List<ProductionOrder>> ordersByCategory = finishedOrders.stream()
                .collect(Collectors.groupingBy(ProductionOrder::getCategoryId));

        for (Map.Entry<Long, List<ProductionOrder>> entry : ordersByCategory.entrySet()) {
            Long categoryId = entry.getKey();
            List<ProductionOrder> orders = entry.getValue();

            CostStatistics stats = calculateCostStatistics(date, categoryId, orders);
            CostStatistics existStats = costStatisticsMapper.selectOne(
                    new LambdaQueryWrapper<CostStatistics>()
                            .eq(CostStatistics::getStatisticsDate, date.withDayOfMonth(1))
                            .eq(CostStatistics::getCategoryId, categoryId)
            );

            if (existStats != null) {
                stats.setId(existStats.getId());
                costStatisticsMapper.updateById(stats);
            } else {
                costStatisticsMapper.insert(stats);
            }

            generateCostDetails(stats.getId(), orders);
        }
    }

    private CostStatistics calculateCostStatistics(LocalDate date, Long categoryId, List<ProductionOrder> orders) {
        CostStatistics stats = new CostStatistics();
        stats.setStatisticsDate(date.withDayOfMonth(1));
        stats.setCategoryId(categoryId);

        int totalQuantity = orders.stream().mapToInt(ProductionOrder::getActualQuantity).sum();
        int totalDefective = orders.stream().mapToInt(ProductionOrder::getDefectiveQuantity).sum();

        BigDecimal materialCost = orders.stream()
                .map(o -> o.getMaterialUsage() != null ? o.getMaterialUsage() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal moldCost = BigDecimal.valueOf(totalQuantity).multiply(MOLD_COST_PER_UNIT);
        BigDecimal energyCost = BigDecimal.valueOf(totalQuantity).multiply(ENERGY_COST_PER_UNIT);
        BigDecimal laborCost = BigDecimal.valueOf(totalQuantity).multiply(LABOR_COST_PER_UNIT);
        BigDecimal defectiveCost = BigDecimal.valueOf(totalDefective)
                .multiply(DEFECTIVE_COST_RATE)
                .multiply(MOLD_COST_PER_UNIT.add(ENERGY_COST_PER_UNIT).add(LABOR_COST_PER_UNIT));

        BigDecimal totalCost = materialCost.add(moldCost).add(energyCost).add(laborCost).add(defectiveCost);
        BigDecimal unitCost = totalQuantity > 0 ? totalCost.divide(BigDecimal.valueOf(totalQuantity), 4, RoundingMode.HALF_UP) : BigDecimal.ZERO;

        stats.setMaterialCost(materialCost);
        stats.setMoldCost(moldCost);
        stats.setEnergyCost(energyCost);
        stats.setLaborCost(laborCost);
        stats.setDefectiveCost(defectiveCost);
        stats.setTotalCost(totalCost);
        stats.setProductionQuantity(totalQuantity);
        stats.setUnitCost(unitCost);

        return stats;
    }

    private void generateCostDetails(Long costId, List<ProductionOrder> orders) {
        costDetailMapper.delete(
                new LambdaQueryWrapper<CostDetail>()
                        .eq(CostDetail::getCostId, costId)
        );

        for (ProductionOrder order : orders) {
            CostDetail detail = calculateOrderCost(costId, order);
            costDetailMapper.insert(detail);
        }
    }

    private CostDetail calculateOrderCost(Long costId, ProductionOrder order) {
        CostDetail detail = new CostDetail();
        detail.setCostId(costId);
        detail.setOrderId(order.getId());
        detail.setOrderNo(order.getOrderNo());

        int quantity = order.getActualQuantity() != null ? order.getActualQuantity() : 0;
        int defective = order.getDefectiveQuantity() != null ? order.getDefectiveQuantity() : 0;

        BigDecimal materialCost = order.getMaterialUsage() != null ? order.getMaterialUsage() : BigDecimal.ZERO;
        BigDecimal moldCost = BigDecimal.valueOf(quantity).multiply(MOLD_COST_PER_UNIT);
        BigDecimal energyCost = BigDecimal.valueOf(quantity).multiply(ENERGY_COST_PER_UNIT);
        BigDecimal laborCost = BigDecimal.valueOf(quantity).multiply(LABOR_COST_PER_UNIT);
        BigDecimal defectiveCost = BigDecimal.valueOf(defective)
                .multiply(DEFECTIVE_COST_RATE)
                .multiply(MOLD_COST_PER_UNIT.add(ENERGY_COST_PER_UNIT).add(LABOR_COST_PER_UNIT));

        BigDecimal totalCost = materialCost.add(moldCost).add(energyCost).add(laborCost).add(defectiveCost);

        detail.setMaterialCost(materialCost);
        detail.setMoldCost(moldCost);
        detail.setEnergyCost(energyCost);
        detail.setLaborCost(laborCost);
        detail.setDefectiveCost(defectiveCost);
        detail.setTotalCost(totalCost);

        return detail;
    }

    public List<CostStatistics> getMonthlyReport(LocalDate startDate, LocalDate endDate, Long categoryId) {
        LambdaQueryWrapper<CostStatistics> wrapper = new LambdaQueryWrapper<>();
        if (startDate != null) {
            wrapper.ge(CostStatistics::getStatisticsDate, startDate);
        }
        if (endDate != null) {
            wrapper.le(CostStatistics::getStatisticsDate, endDate);
        }
        if (categoryId != null) {
            wrapper.eq(CostStatistics::getCategoryId, categoryId);
        }
        wrapper.orderByDesc(CostStatistics::getStatisticsDate);
        return costStatisticsMapper.selectList(wrapper);
    }

    public List<CostDetail> getCostDetails(Long costId) {
        return costDetailMapper.selectList(
                new LambdaQueryWrapper<CostDetail>()
                        .eq(CostDetail::getCostId, costId)
        );
    }

    public CostDetail getOrderCostDetail(Long orderId) {
        ProductionOrder order = productionOrderMapper.selectById(orderId);
        if (order == null) {
            return null;
        }
        return calculateOrderCost(0L, order);
    }

    @Transactional(rollbackFor = Exception.class)
    @Log(value = "删除成本报表", module = "成本统计")
    public void deleteCostReport(Long id) {
        costStatisticsMapper.deleteById(id);
        costDetailMapper.delete(
                new LambdaQueryWrapper<CostDetail>()
                        .eq(CostDetail::getCostId, id)
        );
    }
}
