package com.cosmetics.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.cosmetics.common.ResultCode;
import com.cosmetics.entity.*;
import com.cosmetics.exception.BusinessException;
import com.cosmetics.mapper.*;
import com.cosmetics.service.CostStatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CostStatisticsServiceImpl implements CostStatisticsService {

    private final CostStatisticsMapper costStatisticsMapper;
    private final WorkOrderMapper workOrderMapper;
    private final WorkOrderMaterialMapper workOrderMaterialMapper;
    private final MaterialBatchMapper materialBatchMapper;
    private final ProductMapper productMapper;

    @Override
    public CostStatistics getByWorkOrderId(Long workOrderId) {
        return costStatisticsMapper.selectOne(
                new LambdaQueryWrapper<CostStatistics>()
                        .eq(CostStatistics::getWorkOrderId, workOrderId)
        );
    }

    @Override
    public List<CostStatistics> getByDateRange(LocalDate startDate, LocalDate endDate) {
        return costStatisticsMapper.selectList(
                new LambdaQueryWrapper<CostStatistics>()
                        .between(CostStatistics::getStatisticsTime, startDate.atStartOfDay(), endDate.atTime(23, 59, 59))
                        .orderByDesc(CostStatistics::getStatisticsTime)
        );
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateCost(Long id, CostStatistics cost) {
        CostStatistics exist = costStatisticsMapper.selectById(id);
        if (exist == null) {
            throw new BusinessException(ResultCode.DATA_NOT_FOUND);
        }

        BigDecimal totalCost = cost.getMaterialCost()
                .add(cost.getPackagingCost())
                .add(cost.getEnergyCost())
                .add(cost.getLaborCost())
                .add(cost.getScrapCost());

        exist.setMaterialCost(cost.getMaterialCost());
        exist.setPackagingCost(cost.getPackagingCost());
        exist.setEnergyCost(cost.getEnergyCost());
        exist.setLaborCost(cost.getLaborCost());
        exist.setScrapCost(cost.getScrapCost());
        exist.setTotalCost(totalCost);

        WorkOrder workOrder = workOrderMapper.selectById(exist.getWorkOrderId());
        if (workOrder != null && workOrder.getActualQuantity() != null
                && workOrder.getActualQuantity().compareTo(BigDecimal.ZERO) > 0) {
            exist.setUnitCost(totalCost.divide(workOrder.getActualQuantity(), 4, RoundingMode.HALF_UP));
        }

        exist.setStatisticsTime(LocalDateTime.now());
        costStatisticsMapper.updateById(exist);
    }

    @Override
    public CostStatistics getById(Long id) {
        return costStatisticsMapper.selectById(id);
    }

    @Override
    public Map<String, Object> getCostSummary(LocalDate startDate, LocalDate endDate) {
        Map<String, Object> summary = new HashMap<>();

        List<CostStatistics> costs = getByDateRange(startDate, endDate);

        BigDecimal totalMaterialCost = BigDecimal.ZERO;
        BigDecimal totalPackagingCost = BigDecimal.ZERO;
        BigDecimal totalEnergyCost = BigDecimal.ZERO;
        BigDecimal totalLaborCost = BigDecimal.ZERO;
        BigDecimal totalScrapCost = BigDecimal.ZERO;
        BigDecimal totalCost = BigDecimal.ZERO;
        BigDecimal totalQuantity = BigDecimal.ZERO;

        for (CostStatistics cost : costs) {
            totalMaterialCost = totalMaterialCost.add(cost.getMaterialCost());
            totalPackagingCost = totalPackagingCost.add(cost.getPackagingCost());
            totalEnergyCost = totalEnergyCost.add(cost.getEnergyCost());
            totalLaborCost = totalLaborCost.add(cost.getLaborCost());
            totalScrapCost = totalScrapCost.add(cost.getScrapCost());
            totalCost = totalCost.add(cost.getTotalCost());

            WorkOrder workOrder = workOrderMapper.selectById(cost.getWorkOrderId());
            if (workOrder != null && workOrder.getActualQuantity() != null) {
                totalQuantity = totalQuantity.add(workOrder.getActualQuantity());
            }
        }

        summary.put("totalOrders", costs.size());
        summary.put("totalMaterialCost", totalMaterialCost);
        summary.put("totalPackagingCost", totalPackagingCost);
        summary.put("totalEnergyCost", totalEnergyCost);
        summary.put("totalLaborCost", totalLaborCost);
        summary.put("totalScrapCost", totalScrapCost);
        summary.put("totalCost", totalCost);
        summary.put("totalQuantity", totalQuantity);
        if (totalQuantity.compareTo(BigDecimal.ZERO) > 0) {
            summary.put("avgUnitCost", totalCost.divide(totalQuantity, 4, RoundingMode.HALF_UP));
        } else {
            summary.put("avgUnitCost", BigDecimal.ZERO);
        }

        Map<String, BigDecimal> costStructure = new LinkedHashMap<>();
        if (totalCost.compareTo(BigDecimal.ZERO) > 0) {
            costStructure.put("materialCost", totalMaterialCost.multiply(new BigDecimal("100")).divide(totalCost, 2, RoundingMode.HALF_UP));
            costStructure.put("packagingCost", totalPackagingCost.multiply(new BigDecimal("100")).divide(totalCost, 2, RoundingMode.HALF_UP));
            costStructure.put("energyCost", totalEnergyCost.multiply(new BigDecimal("100")).divide(totalCost, 2, RoundingMode.HALF_UP));
            costStructure.put("laborCost", totalLaborCost.multiply(new BigDecimal("100")).divide(totalCost, 2, RoundingMode.HALF_UP));
            costStructure.put("scrapCost", totalScrapCost.multiply(new BigDecimal("100")).divide(totalCost, 2, RoundingMode.HALF_UP));
        }
        summary.put("costStructure", costStructure);

        return summary;
    }

    @Override
    public Map<String, Object> getCostTrend(LocalDate startDate, LocalDate endDate) {
        Map<String, Object> trend = new LinkedHashMap<>();

        List<CostStatistics> costs = getByDateRange(startDate, endDate);

        Map<LocalDate, List<CostStatistics>> groupedByDate = costs.stream()
                .collect(Collectors.groupingBy(c -> c.getStatisticsTime().toLocalDate()));

        List<LocalDate> dates = new ArrayList<>();
        List<BigDecimal> dailyCosts = new ArrayList<>();
        List<BigDecimal> unitCosts = new ArrayList<>();

        LocalDate current = startDate;
        while (!current.isAfter(endDate)) {
            dates.add(current);
            List<CostStatistics> dayCosts = groupedByDate.getOrDefault(current, Collections.emptyList());

            BigDecimal dayTotal = dayCosts.stream()
                    .map(CostStatistics::getTotalCost)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            dailyCosts.add(dayTotal);

            BigDecimal dayQuantity = dayCosts.stream()
                    .map(c -> {
                        WorkOrder wo = workOrderMapper.selectById(c.getWorkOrderId());
                        return wo != null && wo.getActualQuantity() != null ? wo.getActualQuantity() : BigDecimal.ZERO;
                    })
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            if (dayQuantity.compareTo(BigDecimal.ZERO) > 0) {
                unitCosts.add(dayTotal.divide(dayQuantity, 4, RoundingMode.HALF_UP));
            } else {
                unitCosts.add(BigDecimal.ZERO);
            }

            current = current.plusDays(1);
        }

        trend.put("dates", dates);
        trend.put("dailyCosts", dailyCosts);
        trend.put("unitCosts", unitCosts);

        return trend;
    }

    @Override
    public Map<String, Object> getCostByProduct(LocalDate startDate, LocalDate endDate) {
        List<CostStatistics> costs = getByDateRange(startDate, endDate);

        Map<Long, List<CostStatistics>> groupedByProduct = new HashMap<>();
        Map<Long, BigDecimal> productQuantity = new HashMap<>();

        for (CostStatistics cost : costs) {
            WorkOrder workOrder = workOrderMapper.selectById(cost.getWorkOrderId());
            if (workOrder != null) {
                Long productId = workOrder.getProductId();
                groupedByProduct.computeIfAbsent(productId, k -> new ArrayList<>()).add(cost);
                productQuantity.merge(productId,
                        workOrder.getActualQuantity() != null ? workOrder.getActualQuantity() : BigDecimal.ZERO,
                        BigDecimal::add);
            }
        }

        List<Map<String, Object>> productCosts = new ArrayList<>();
        for (Map.Entry<Long, List<CostStatistics>> entry : groupedByProduct.entrySet()) {
            Product product = productMapper.selectById(entry.getKey());
            if (product == null) continue;

            BigDecimal totalCost = entry.getValue().stream()
                    .map(CostStatistics::getTotalCost)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal quantity = productQuantity.getOrDefault(entry.getKey(), BigDecimal.ZERO);

            Map<String, Object> productData = new HashMap<>();
            productData.put("productId", product.getId());
            productData.put("productCode", product.getProductCode());
            productData.put("productName", product.getName());
            productData.put("totalCost", totalCost);
            productData.put("totalQuantity", quantity);
            productData.put("orderCount", entry.getValue().size());
            if (quantity.compareTo(BigDecimal.ZERO) > 0) {
                productData.put("unitCost", totalCost.divide(quantity, 4, RoundingMode.HALF_UP));
            } else {
                productData.put("unitCost", BigDecimal.ZERO);
            }

            productCosts.add(productData);
        }

        productCosts.sort((a, b) -> ((BigDecimal) b.get("totalCost")).compareTo((BigDecimal) a.get("totalCost")));

        Map<String, Object> result = new HashMap<>();
        result.put("productCosts", productCosts);
        result.put("totalProducts", productCosts.size());

        return result;
    }

    @Override
    public Map<String, Object> getCostDetail(Long workOrderId) {
        Map<String, Object> detail = new HashMap<>();

        CostStatistics cost = getByWorkOrderId(workOrderId);
        if (cost == null) {
            throw new BusinessException(ResultCode.DATA_NOT_FOUND.getCode(), "成本统计不存在");
        }

        WorkOrder workOrder = workOrderMapper.selectById(workOrderId);
        Product product = productMapper.selectById(workOrder.getProductId());

        detail.put("cost", cost);
        detail.put("workOrder", workOrder);
        detail.put("product", product);

        List<WorkOrderMaterial> materials = workOrderMaterialMapper.selectList(
                new LambdaQueryWrapper<WorkOrderMaterial>()
                        .eq(WorkOrderMaterial::getWorkOrderId, workOrderId)
        );

        List<Map<String, Object>> materialDetails = new ArrayList<>();
        for (WorkOrderMaterial wom : materials) {
            Map<String, Object> matDetail = new HashMap<>();
            matDetail.put("materialId", wom.getMaterialId());
            matDetail.put("planQuantity", wom.getPlanQuantity());
            matDetail.put("actualQuantity", wom.getActualQuantity());
            matDetail.put("unit", wom.getUnit());

            if (wom.getMaterialBatchId() != null) {
                MaterialBatch batch = materialBatchMapper.selectById(wom.getMaterialBatchId());
                if (batch != null) {
                    matDetail.put("unitPrice", batch.getUnitPrice());
                    if (batch.getUnitPrice() != null && wom.getActualQuantity() != null) {
                        matDetail.put("totalPrice", batch.getUnitPrice().multiply(wom.getActualQuantity()));
                    }
                }
            }

            materialDetails.add(matDetail);
        }

        detail.put("materialDetails", materialDetails);

        return detail;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void recalculateCost(Long workOrderId) {
        CostStatistics cost = getByWorkOrderId(workOrderId);
        if (cost == null) {
            throw new BusinessException(ResultCode.DATA_NOT_FOUND.getCode(), "成本统计不存在");
        }

        List<WorkOrderMaterial> materials = workOrderMaterialMapper.selectList(
                new LambdaQueryWrapper<WorkOrderMaterial>()
                        .eq(WorkOrderMaterial::getWorkOrderId, workOrderId)
        );

        BigDecimal materialCost = BigDecimal.ZERO;
        for (WorkOrderMaterial wom : materials) {
            if (wom.getMaterialBatchId() != null && wom.getActualQuantity() != null) {
                MaterialBatch batch = materialBatchMapper.selectById(wom.getMaterialBatchId());
                if (batch != null && batch.getUnitPrice() != null) {
                    materialCost = materialCost.add(batch.getUnitPrice().multiply(wom.getActualQuantity()));
                }
            }
        }

        cost.setMaterialCost(materialCost);
        BigDecimal totalCost = materialCost
                .add(cost.getPackagingCost())
                .add(cost.getEnergyCost())
                .add(cost.getLaborCost())
                .add(cost.getScrapCost());
        cost.setTotalCost(totalCost);

        WorkOrder workOrder = workOrderMapper.selectById(workOrderId);
        if (workOrder != null && workOrder.getActualQuantity() != null
                && workOrder.getActualQuantity().compareTo(BigDecimal.ZERO) > 0) {
            cost.setUnitCost(totalCost.divide(workOrder.getActualQuantity(), 4, RoundingMode.HALF_UP));
        }

        cost.setStatisticsTime(LocalDateTime.now());
        costStatisticsMapper.updateById(cost);
    }
}
