package com.hardware.stamping.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.hardware.stamping.annotation.Log;
import com.hardware.stamping.dto.CostAccountingQueryDTO;
import com.hardware.stamping.entity.CostAccounting;
import com.hardware.stamping.entity.MaterialInventory;
import com.hardware.stamping.entity.ProductionOrder;
import com.hardware.stamping.exception.BusinessException;
import com.hardware.stamping.mapper.CostAccountingMapper;
import com.hardware.stamping.mapper.MaterialInventoryMapper;
import com.hardware.stamping.mapper.ProductionOrderMapper;
import com.hardware.stamping.vo.CostAccountingVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CostAccountingService {

    @Autowired
    private CostAccountingMapper costAccountingMapper;

    @Autowired
    private ProductionOrderMapper productionOrderMapper;

    @Autowired
    private MaterialInventoryMapper materialInventoryMapper;

    @Log("新增成本核算记录")
    @Transactional(rollbackFor = Exception.class)
    public void addCostAccounting(CostAccounting costAccounting) {
        calculateCosts(costAccounting);
        costAccounting.setCreateTime(java.time.LocalDateTime.now());
        costAccounting.setUpdateTime(java.time.LocalDateTime.now());
        costAccounting.setDeleted(0);
        costAccountingMapper.insert(costAccounting);
    }

    @Log("更新成本核算记录")
    @Transactional(rollbackFor = Exception.class)
    public void updateCostAccounting(CostAccounting costAccounting) {
        CostAccounting exist = costAccountingMapper.selectById(costAccounting.getId());
        if (exist == null) {
            throw new BusinessException("成本核算记录不存在");
        }
        calculateCosts(costAccounting);
        costAccounting.setUpdateTime(java.time.LocalDateTime.now());
        costAccountingMapper.updateById(costAccounting);
    }

    @Log("删除成本核算记录")
    @Transactional(rollbackFor = Exception.class)
    public void deleteCostAccounting(Long id) {
        costAccountingMapper.deleteById(id);
    }

    public CostAccounting getById(Long id) {
        return costAccountingMapper.selectById(id);
    }

    public IPage<CostAccountingVO> queryPage(CostAccountingQueryDTO queryDTO) {
        Page<CostAccountingVO> page = new Page<>(queryDTO.getPageNum(), queryDTO.getPageSize());
        return costAccountingMapper.queryPage(page, queryDTO);
    }

    public List<CostAccounting> listAll() {
        return costAccountingMapper.selectList(
                new LambdaQueryWrapper<CostAccounting>()
                        .orderByDesc(CostAccounting::getAccountingDate)
        );
    }

    public List<CostAccounting> listByCategory(Long categoryId) {
        return costAccountingMapper.selectList(
                new LambdaQueryWrapper<CostAccounting>()
                        .eq(CostAccounting::getCategoryId, categoryId)
                        .orderByDesc(CostAccounting::getAccountingDate)
        );
    }

    public List<CostAccounting> listByDateRange(LocalDate startDate, LocalDate endDate) {
        return costAccountingMapper.selectList(
                new LambdaQueryWrapper<CostAccounting>()
                        .between(CostAccounting::getAccountingDate, startDate, endDate)
                        .orderByDesc(CostAccounting::getAccountingDate)
        );
    }

    public Map<String, Object> generateCostReport(LocalDate startDate, LocalDate endDate) {
        List<CostAccounting> costList = listByDateRange(startDate, endDate);

        Map<Long, List<CostAccounting>> categoryGroup = costList.stream()
                .collect(java.util.stream.Collectors.groupingBy(CostAccounting::getCategoryId));

        Map<String, Object> report = new HashMap<>();
        report.put("startDate", startDate);
        report.put("endDate", endDate);
        report.put("totalRecords", costList.size());

        BigDecimal totalMaterialCost = BigDecimal.ZERO;
        BigDecimal totalMaterialLossCost = BigDecimal.ZERO;
        BigDecimal totalMoldWearCost = BigDecimal.ZERO;
        BigDecimal totalLaborCost = BigDecimal.ZERO;
        BigDecimal totalOutsourcingCost = BigDecimal.ZERO;
        BigDecimal totalOtherCost = BigDecimal.ZERO;
        BigDecimal totalCost = BigDecimal.ZERO;
        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal totalProfit = BigDecimal.ZERO;
        BigDecimal totalQuantity = BigDecimal.ZERO;

        for (CostAccounting cost : costList) {
            totalMaterialCost = totalMaterialCost.add(nullSafe(cost.getMaterialCost()));
            totalMaterialLossCost = totalMaterialLossCost.add(nullSafe(cost.getMaterialLossCost()));
            totalMoldWearCost = totalMoldWearCost.add(nullSafe(cost.getMoldWearCost()));
            totalLaborCost = totalLaborCost.add(nullSafe(cost.getLaborCost()));
            totalOutsourcingCost = totalOutsourcingCost.add(nullSafe(cost.getOutsourcingCost()));
            totalOtherCost = totalOtherCost.add(nullSafe(cost.getOtherCost()));
            totalCost = totalCost.add(nullSafe(cost.getTotalCost()));
            totalRevenue = totalRevenue.add(nullSafe(cost.getRevenue()));
            totalProfit = totalProfit.add(nullSafe(cost.getProfit()));
            totalQuantity = totalQuantity.add(nullSafe(cost.getProductionQuantity()));
        }

        Map<String, BigDecimal> totalSummary = new HashMap<>();
        totalSummary.put("materialCost", totalMaterialCost);
        totalSummary.put("materialLossCost", totalMaterialLossCost);
        totalSummary.put("moldWearCost", totalMoldWearCost);
        totalSummary.put("laborCost", totalLaborCost);
        totalSummary.put("outsourcingCost", totalOutsourcingCost);
        totalSummary.put("otherCost", totalOtherCost);
        totalSummary.put("totalCost", totalCost);
        totalSummary.put("revenue", totalRevenue);
        totalSummary.put("profit", totalProfit);
        totalSummary.put("productionQuantity", totalQuantity);

        if (totalRevenue.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal overallMargin = totalProfit.divide(totalRevenue, 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"));
            totalSummary.put("profitMargin", overallMargin);
        }

        report.put("totalSummary", totalSummary);
        report.put("categoryDetails", categoryGroup);

        return report;
    }

    public Map<String, Object> getOrderCostDetails(Long orderId) {
        ProductionOrder order = productionOrderMapper.selectById(orderId);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }

        Map<String, Object> details = new HashMap<>();
        details.put("order", order);

        if (order.getMaterialId() != null) {
            MaterialInventory material = materialInventoryMapper.selectById(order.getMaterialId());
            details.put("material", material);

            if (material != null && material.getUnitPrice() != null) {
                BigDecimal materialCost = material.getUnitPrice().multiply(order.getQuantity());
                details.put("calculatedMaterialCost", materialCost);
            }
        }

        List<CostAccounting> costRecords = costAccountingMapper.selectList(
                new LambdaQueryWrapper<CostAccounting>()
                        .eq(CostAccounting::getOrderId, orderId)
        );
        details.put("costRecords", costRecords);

        return details;
    }

    @Log("自动生成生产成本核算")
    @Transactional(rollbackFor = Exception.class)
    public void autoGenerateAccounting(Long orderId) {
        ProductionOrder order = productionOrderMapper.selectById(orderId);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }

        CostAccounting accounting = new CostAccounting();
        accounting.setAccountingDate(LocalDate.now());
        accounting.setOrderId(orderId);
        accounting.setOrderNo(order.getOrderNo());
        accounting.setCategoryId(order.getCategoryId());
        accounting.setCategoryName(order.getCategoryName());
        accounting.setProductionQuantity(order.getQuantity());

        if (order.getMaterialId() != null) {
            MaterialInventory material = materialInventoryMapper.selectById(order.getMaterialId());
            if (material != null && material.getUnitPrice() != null) {
                accounting.setMaterialCost(material.getUnitPrice().multiply(order.getQuantity()));
            }
        }

        if (order.getProductionHours() != null) {
            accounting.setLaborCost(order.getProductionHours().multiply(new BigDecimal("50")));
        }

        calculateCosts(accounting);
        accounting.setCreateTime(java.time.LocalDateTime.now());
        accounting.setUpdateTime(java.time.LocalDateTime.now());
        accounting.setDeleted(0);
        costAccountingMapper.insert(accounting);
    }

    private void calculateCosts(CostAccounting costAccounting) {
        BigDecimal totalCost = BigDecimal.ZERO;
        totalCost = totalCost.add(nullSafe(costAccounting.getMaterialCost()));
        totalCost = totalCost.add(nullSafe(costAccounting.getMaterialLossCost()));
        totalCost = totalCost.add(nullSafe(costAccounting.getMoldWearCost()));
        totalCost = totalCost.add(nullSafe(costAccounting.getLaborCost()));
        totalCost = totalCost.add(nullSafe(costAccounting.getOutsourcingCost()));
        totalCost = totalCost.add(nullSafe(costAccounting.getOtherCost()));
        costAccounting.setTotalCost(totalCost);

        if (costAccounting.getProductionQuantity() != null
                && costAccounting.getProductionQuantity().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal unitCost = totalCost.divide(costAccounting.getProductionQuantity(), 4, RoundingMode.HALF_UP);
            costAccounting.setUnitCost(unitCost);
        }

        if (costAccounting.getRevenue() != null) {
            BigDecimal profit = costAccounting.getRevenue().subtract(totalCost);
            costAccounting.setProfit(profit);

            if (costAccounting.getRevenue().compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal profitMargin = profit.divide(costAccounting.getRevenue(), 4, RoundingMode.HALF_UP)
                        .multiply(new BigDecimal("100"));
                costAccounting.setProfitMargin(profitMargin);
            }
        }
    }

    private BigDecimal nullSafe(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }
}
