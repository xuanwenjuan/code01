package com.snacktrace.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.snacktrace.annotation.RequireRole;
import com.snacktrace.entity.*;
import com.snacktrace.enums.RoleEnum;
import com.snacktrace.mapper.ProductionCostMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProductionCostService extends ServiceImpl<ProductionCostMapper, ProductionCost> {

    @Autowired
    private WorkOrderMaterialService workOrderMaterialService;

    @Autowired
    private WorkOrderMaterialLossService materialLossService;

    @Autowired
    private ProductionWorkOrderService workOrderService;

    @Autowired
    private QcInspectionService qcInspectionService;

    public Page<ProductionCost> queryCostPage(Long categoryId, Long productId,
                                               LocalDate startDate, LocalDate endDate,
                                               int page, int size) {
        LambdaQueryWrapper<ProductionCost> wrapper = new LambdaQueryWrapper<>();
        if (categoryId != null) {
            wrapper.eq(ProductionCost::getCategoryId, categoryId);
        }
        if (productId != null) {
            wrapper.eq(ProductionCost::getProductId, productId);
        }
        if (startDate != null) {
            wrapper.ge(ProductionCost::getCostDate, startDate);
        }
        if (endDate != null) {
            wrapper.le(ProductionCost::getCostDate, endDate);
        }
        wrapper.orderByDesc(ProductionCost::getCostDate);
        return page(new Page<>(page, size), wrapper);
    }

    @Transactional(rollbackFor = Exception.class)
    @RequireRole({RoleEnum.ADMIN, RoleEnum.TEAM_LEADER})
    public ProductionCost calculateAndSaveCost(Long workOrderId, BigDecimal equipmentCost,
                                                BigDecimal packagingCost, BigDecimal laborCost,
                                                Long operatorId, String operatorName) {
        ProductionWorkOrder workOrder = workOrderService.getById(workOrderId);
        if (workOrder == null) {
            throw new RuntimeException("工单不存在");
        }

        List<WorkOrderMaterial> materials = workOrderMaterialService.list(
                new LambdaQueryWrapper<WorkOrderMaterial>()
                        .eq(WorkOrderMaterial::getWorkOrderId, workOrderId)
        );

        BigDecimal materialCost = materials.stream()
                .map(m -> m.getTotalCost() != null ? m.getTotalCost() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalLossQuantity = materialLossService.getTotalLossByWorkOrderId(workOrderId);
        BigDecimal avgMaterialUnitCost = BigDecimal.ZERO;
        BigDecimal totalQty = materials.stream()
                .map(m -> m.getActualQuantity() != null ? m.getActualQuantity() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        if (totalQty.compareTo(BigDecimal.ZERO) > 0) {
            avgMaterialUnitCost = materialCost.divide(totalQty, 4, RoundingMode.HALF_UP);
        }
        BigDecimal defectCost = totalLossQuantity.multiply(avgMaterialUnitCost);

        List<QcInspection> inspections = qcInspectionService.list(
                new LambdaQueryWrapper<QcInspection>()
                        .eq(QcInspection::getWorkOrderId, workOrderId)
        );
        BigDecimal qcDefectCost = inspections.stream()
                .map(q -> q.getDefectQuantity() != null ?
                        q.getDefectQuantity().multiply(avgMaterialUnitCost) : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        defectCost = defectCost.add(qcDefectCost);

        BigDecimal totalCost = materialCost
                .add(equipmentCost != null ? equipmentCost : BigDecimal.ZERO)
                .add(packagingCost != null ? packagingCost : BigDecimal.ZERO)
                .add(laborCost != null ? laborCost : BigDecimal.ZERO)
                .add(defectCost);

        ProductionCost cost = new ProductionCost();
        cost.setWorkOrderId(workOrderId);
        cost.setProductId(workOrder.getProductId());
        cost.setCategoryId(null);
        cost.setMaterialCost(materialCost);
        cost.setEquipmentCost(equipmentCost != null ? equipmentCost : BigDecimal.ZERO);
        cost.setPackagingCost(packagingCost != null ? packagingCost : BigDecimal.ZERO);
        cost.setLaborCost(laborCost != null ? laborCost : BigDecimal.ZERO);
        cost.setDefectCost(defectCost);
        cost.setTotalCost(totalCost);
        cost.setCostDate(LocalDate.now());
        cost.setCreateTime(LocalDateTime.now());
        cost.setUpdateTime(LocalDateTime.now());

        save(cost);
        return cost;
    }

    public Map<String, Object> getCostStatistics(Long categoryId, LocalDate startDate, LocalDate endDate) {
        List<ProductionCost> costs = queryCostPage(categoryId, null, startDate, endDate, 1, Integer.MAX_VALUE).getRecords();

        BigDecimal totalMaterialCost = costs.stream()
                .map(ProductionCost::getMaterialCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalEquipmentCost = costs.stream()
                .map(ProductionCost::getEquipmentCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalPackagingCost = costs.stream()
                .map(ProductionCost::getPackagingCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalLaborCost = costs.stream()
                .map(ProductionCost::getLaborCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalDefectCost = costs.stream()
                .map(ProductionCost::getDefectCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalCost = costs.stream()
                .map(ProductionCost::getTotalCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<LocalDate, BigDecimal> dailyCosts = costs.stream()
                .collect(Collectors.groupingBy(
                        ProductionCost::getCostDate,
                        Collectors.reducing(BigDecimal.ZERO, ProductionCost::getTotalCost, BigDecimal::add)
                ));

        Map<String, BigDecimal> costStructure = new HashMap<>();
        costStructure.put("materialCost", totalMaterialCost);
        costStructure.put("equipmentCost", totalEquipmentCost);
        costStructure.put("packagingCost", totalPackagingCost);
        costStructure.put("laborCost", totalLaborCost);
        costStructure.put("defectCost", totalDefectCost);
        costStructure.put("totalCost", totalCost);

        BigDecimal avgCostPerOrder = costs.isEmpty() ? BigDecimal.ZERO :
                totalCost.divide(BigDecimal.valueOf(costs.size()), 2, RoundingMode.HALF_UP);

        Map<String, Object> result = new HashMap<>();
        result.put("costStructure", costStructure);
        result.put("dailyCosts", dailyCosts);
        result.put("totalOrders", costs.size());
        result.put("avgCostPerOrder", avgCostPerOrder);
        result.put("defectRate", totalCost.compareTo(BigDecimal.ZERO) > 0 ?
                totalDefectCost.divide(totalCost, 4, RoundingMode.HALF_UP) : BigDecimal.ZERO);

        return result;
    }

    public Map<String, BigDecimal> getCategoryCostSummary(LocalDate startDate, LocalDate endDate) {
        List<ProductionCost> costs = queryCostPage(null, null, startDate, endDate, 1, Integer.MAX_VALUE).getRecords();
        return costs.stream()
                .filter(c -> c.getCategoryId() != null)
                .collect(Collectors.groupingBy(
                        cost -> "category_" + cost.getCategoryId(),
                        Collectors.reducing(BigDecimal.ZERO, ProductionCost::getTotalCost, BigDecimal::add)
                ));
    }

    @Transactional(rollbackFor = Exception.class)
    @RequireRole({RoleEnum.ADMIN})
    public boolean updateCostBreakdown(Long costId, BigDecimal equipmentCost,
                                        BigDecimal packagingCost, BigDecimal laborCost,
                                        BigDecimal defectCost) {
        ProductionCost cost = getById(costId);
        if (cost == null) {
            return false;
        }

        if (equipmentCost != null) {
            cost.setEquipmentCost(equipmentCost);
        }
        if (packagingCost != null) {
            cost.setPackagingCost(packagingCost);
        }
        if (laborCost != null) {
            cost.setLaborCost(laborCost);
        }
        if (defectCost != null) {
            cost.setDefectCost(defectCost);
        }

        BigDecimal totalCost = cost.getMaterialCost()
                .add(cost.getEquipmentCost())
                .add(cost.getPackagingCost())
                .add(cost.getLaborCost())
                .add(cost.getDefectCost());
        cost.setTotalCost(totalCost);
        cost.setUpdateTime(LocalDateTime.now());

        return updateById(cost);
    }
}
