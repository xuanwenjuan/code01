package com.flange.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.flange.annotation.RequiresRole;
import com.flange.common.RoleConstants;
import com.flange.entity.CostAccounting;
import com.flange.entity.ProductionLoss;
import com.flange.exception.BusinessException;
import com.flange.mapper.CostAccountingMapper;
import com.flange.mapper.ProductionLossMapper;
import com.flange.util.CacheUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class CostAccountingService {

    private final CostAccountingMapper costMapper;
    private final ProductionLossMapper productionLossMapper;
    private final CacheUtil cacheUtil;

    private static final String CACHE_COST_PREFIX = "cost:";

    @SuppressWarnings("unchecked")
    public IPage<CostAccounting> getCostPage(int page, int size, String status, Long orderId) {
        String cacheKey = CACHE_COST_PREFIX + "page:" + page + ":" + size + ":" + status + ":" + orderId;
        Object cached = cacheUtil.get(cacheKey);
        if (cached != null) {
            return (IPage<CostAccounting>) cached;
        }

        LambdaQueryWrapper<CostAccounting> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(status)) {
            wrapper.eq(CostAccounting::getStatus, status);
        }
        if (orderId != null) {
            wrapper.eq(CostAccounting::getOrderId, orderId);
        }
        wrapper.orderByDesc(CostAccounting::getCreateTime);
        IPage<CostAccounting> result = costMapper.selectPage(new Page<>(page, size), wrapper);
        cacheUtil.set(cacheKey, result, 5, TimeUnit.MINUTES);
        return result;
    }

    @SuppressWarnings("unchecked")
    public CostAccounting getCostById(Long id) {
        String cacheKey = CACHE_COST_PREFIX + id;
        Object cached = cacheUtil.get(cacheKey);
        if (cached != null) {
            return (CostAccounting) cached;
        }

        CostAccounting cost = costMapper.selectById(id);
        if (cost != null) {
            cacheUtil.set(cacheKey, cost, 10, TimeUnit.MINUTES);
        }
        return cost;
    }

    @SuppressWarnings("unchecked")
    public CostAccounting getCostByOrderId(Long orderId) {
        String cacheKey = CACHE_COST_PREFIX + "order:" + orderId;
        Object cached = cacheUtil.get(cacheKey);
        if (cached != null) {
            return (CostAccounting) cached;
        }

        LambdaQueryWrapper<CostAccounting> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CostAccounting::getOrderId, orderId);
        CostAccounting cost = costMapper.selectOne(wrapper);
        if (cost != null) {
            cacheUtil.set(cacheKey, cost, 10, TimeUnit.MINUTES);
        }
        return cost;
    }

    @Transactional(rollbackFor = Exception.class)
    @RequiresRole({RoleConstants.PROCESS_ENGINEER, RoleConstants.ADMIN})
    public void allocateCost(Long orderId, BigDecimal toolCost, BigDecimal energyCost, String remark) {
        CostAccounting cost = getCostByOrderId(orderId);
        if (cost == null) {
            throw new BusinessException("成本记录不存在");
        }
        if ("CONFIRMED".equals(cost.getStatus())) {
            throw new BusinessException("已确认的成本无法修改");
        }

        if (toolCost != null && toolCost.compareTo(BigDecimal.ZERO) >= 0) {
            cost.setToolCost(cost.getToolCost().add(toolCost));
        }
        if (energyCost != null && energyCost.compareTo(BigDecimal.ZERO) >= 0) {
            cost.setEnergyCost(cost.getEnergyCost().add(energyCost));
        }

        cost.setTotalCost(cost.getMaterialCost()
                .add(cost.getToolCost())
                .add(cost.getEnergyCost())
                .add(cost.getLaborCost())
                .add(cost.getScrapCost()));

        if (StringUtils.hasText(remark)) {
            if (cost.getRemark() == null) {
                cost.setRemark(remark);
            } else {
                cost.setRemark(cost.getRemark() + "; " + remark);
            }
        }

        costMapper.updateById(cost);
        clearCostCache();
    }

    @Transactional(rollbackFor = Exception.class)
    @RequiresRole({RoleConstants.PROCESS_ENGINEER, RoleConstants.ADMIN})
    public void confirmCost(Long costId) {
        CostAccounting cost = costMapper.selectById(costId);
        if (cost == null) {
            throw new BusinessException("成本记录不存在");
        }
        if ("CONFIRMED".equals(cost.getStatus())) {
            throw new BusinessException("该成本已确认");
        }

        cost.setStatus("CONFIRMED");
        cost.setConfirmTime(LocalDateTime.now());
        costMapper.updateById(cost);
        clearCostCache();
    }

    public Map<String, Object> generateCostReport(LocalDate startDate, LocalDate endDate) {
        LambdaQueryWrapper<CostAccounting> wrapper = new LambdaQueryWrapper<>();
        if (startDate != null) {
            wrapper.ge(CostAccounting::getCreateTime, startDate.atStartOfDay());
        }
        if (endDate != null) {
            wrapper.le(CostAccounting::getCreateTime, endDate.atTime(23, 59, 59));
        }
        wrapper.eq(CostAccounting::getStatus, "CONFIRMED");
        List<CostAccounting> costs = costMapper.selectList(wrapper);

        Map<String, Object> report = new HashMap<>();

        BigDecimal totalMaterialCost = BigDecimal.ZERO;
        BigDecimal totalToolCost = BigDecimal.ZERO;
        BigDecimal totalEnergyCost = BigDecimal.ZERO;
        BigDecimal totalLaborCost = BigDecimal.ZERO;
        BigDecimal totalScrapCost = BigDecimal.ZERO;
        BigDecimal totalCost = BigDecimal.ZERO;
        BigDecimal totalLaborHours = BigDecimal.ZERO;
        BigDecimal totalMachineHours = BigDecimal.ZERO;

        for (CostAccounting cost : costs) {
            totalMaterialCost = totalMaterialCost.add(cost.getMaterialCost() != null ? cost.getMaterialCost() : BigDecimal.ZERO);
            totalToolCost = totalToolCost.add(cost.getToolCost() != null ? cost.getToolCost() : BigDecimal.ZERO);
            totalEnergyCost = totalEnergyCost.add(cost.getEnergyCost() != null ? cost.getEnergyCost() : BigDecimal.ZERO);
            totalLaborCost = totalLaborCost.add(cost.getLaborCost() != null ? cost.getLaborCost() : BigDecimal.ZERO);
            totalScrapCost = totalScrapCost.add(cost.getScrapCost() != null ? cost.getScrapCost() : BigDecimal.ZERO);
            totalCost = totalCost.add(cost.getTotalCost() != null ? cost.getTotalCost() : BigDecimal.ZERO);
            totalLaborHours = totalLaborHours.add(cost.getLaborHours() != null ? cost.getLaborHours() : BigDecimal.ZERO);
            totalMachineHours = totalMachineHours.add(cost.getMachineHours() != null ? cost.getMachineHours() : BigDecimal.ZERO);
        }

        report.put("orderCount", costs.size());
        report.put("totalMaterialCost", totalMaterialCost);
        report.put("totalToolCost", totalToolCost);
        report.put("totalEnergyCost", totalEnergyCost);
        report.put("totalLaborCost", totalLaborCost);
        report.put("totalScrapCost", totalScrapCost);
        report.put("totalCost", totalCost);
        report.put("totalLaborHours", totalLaborHours);
        report.put("totalMachineHours", totalMachineHours);

        if (totalCost.compareTo(BigDecimal.ZERO) > 0) {
            report.put("materialCostRatio", totalMaterialCost.multiply(new BigDecimal("100"))
                    .divide(totalCost, 2, RoundingMode.HALF_UP));
            report.put("toolCostRatio", totalToolCost.multiply(new BigDecimal("100"))
                    .divide(totalCost, 2, RoundingMode.HALF_UP));
            report.put("energyCostRatio", totalEnergyCost.multiply(new BigDecimal("100"))
                    .divide(totalCost, 2, RoundingMode.HALF_UP));
            report.put("laborCostRatio", totalLaborCost.multiply(new BigDecimal("100"))
                    .divide(totalCost, 2, RoundingMode.HALF_UP));
            report.put("scrapCostRatio", totalScrapCost.multiply(new BigDecimal("100"))
                    .divide(totalCost, 2, RoundingMode.HALF_UP));
        } else {
            report.put("materialCostRatio", BigDecimal.ZERO);
            report.put("toolCostRatio", BigDecimal.ZERO);
            report.put("energyCostRatio", BigDecimal.ZERO);
            report.put("laborCostRatio", BigDecimal.ZERO);
            report.put("scrapCostRatio", BigDecimal.ZERO);
        }

        if (!costs.isEmpty()) {
            report.put("averageCostPerOrder", totalCost.divide(new BigDecimal(costs.size()), 2, RoundingMode.HALF_UP));
        } else {
            report.put("averageCostPerOrder", BigDecimal.ZERO);
        }

        return report;
    }

    public Map<String, Object> getLossStatistics(Long orderId, LocalDate startDate, LocalDate endDate) {
        LambdaQueryWrapper<ProductionLoss> wrapper = new LambdaQueryWrapper<>();
        if (orderId != null) {
            wrapper.eq(ProductionLoss::getOrderId, orderId);
        }
        if (startDate != null) {
            wrapper.ge(ProductionLoss::getCreateTime, startDate.atStartOfDay());
        }
        if (endDate != null) {
            wrapper.le(ProductionLoss::getCreateTime, endDate.atTime(23, 59, 59));
        }
        List<ProductionLoss> losses = productionLossMapper.selectList(wrapper);

        Map<String, Object> statistics = new HashMap<>();

        BigDecimal totalToolLoss = BigDecimal.ZERO;
        BigDecimal totalScrapLoss = BigDecimal.ZERO;
        int toolLossCount = 0;
        int scrapLossCount = 0;

        for (ProductionLoss loss : losses) {
            if ("TOOL".equals(loss.getLossType())) {
                totalToolLoss = totalToolLoss.add(loss.getTotalPrice() != null ? loss.getTotalPrice() : BigDecimal.ZERO);
                toolLossCount++;
            } else if ("SCRAP".equals(loss.getLossType())) {
                totalScrapLoss = totalScrapLoss.add(loss.getTotalPrice() != null ? loss.getTotalPrice() : BigDecimal.ZERO);
                scrapLossCount++;
            }
        }

        statistics.put("totalLossCount", losses.size());
        statistics.put("toolLossCount", toolLossCount);
        statistics.put("scrapLossCount", scrapLossCount);
        statistics.put("totalToolLoss", totalToolLoss);
        statistics.put("totalScrapLoss", totalScrapLoss);
        statistics.put("totalLossAmount", totalToolLoss.add(totalScrapLoss));

        return statistics;
    }

    private void clearCostCache() {
        cacheUtil.deleteByPattern(CACHE_COST_PREFIX + "*");
    }
}
