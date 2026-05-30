package com.gearbox.manage.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.gearbox.manage.dto.CostStatisticsDTO;
import com.gearbox.manage.entity.*;
import com.gearbox.manage.exception.BusinessException;
import com.gearbox.manage.mapper.CostAccountingMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CostAccountingService extends ServiceImpl<CostAccountingMapper, CostAccounting> {

    private final WorkOrderMaterialService workOrderMaterialService;
    private final WorkProcessService workProcessService;
    private final QualityInspectionService qualityInspectionService;
    private final WorkOrderService workOrderService;

    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = "costStatistics", allEntries = true)
    public CostAccounting calculateCost(Long workOrderId) {
        WorkOrder workOrder = workOrderService.getById(workOrderId);
        if (workOrder == null) {
            throw new BusinessException("工单不存在");
        }

        CostAccounting existing = lambdaQuery()
                .eq(CostAccounting::getWorkOrderId, workOrderId)
                .one();
        if (existing != null) {
            throw new BusinessException("该工单已完成成本核算");
        }

        BigDecimal materialCost = calculateMaterialCost(workOrderId);
        BigDecimal toolCost = calculateToolCost(workOrderId);
        BigDecimal machineCost = calculateMachineCost(workOrderId);
        BigDecimal laborCost = calculateLaborCost(workOrderId);
        BigDecimal scrapCost = calculateScrapCost(workOrderId);
        BigDecimal otherCost = BigDecimal.ZERO;

        BigDecimal totalCost = materialCost
                .add(toolCost)
                .add(machineCost)
                .add(laborCost)
                .add(scrapCost)
                .add(otherCost);

        BigDecimal unitCost = totalCost.divide(
                new BigDecimal(workOrder.getQuantity()),
                4,
                RoundingMode.HALF_UP
        );

        CostAccounting cost = new CostAccounting();
        cost.setWorkOrderId(workOrderId);
        cost.setWorkOrderCode(workOrder.getWorkOrderCode());
        cost.setProductName(workOrder.getProductName());
        cost.setQuantity(workOrder.getQuantity());
        cost.setMaterialCost(materialCost);
        cost.setToolCost(toolCost);
        cost.setMachineCost(machineCost);
        cost.setLaborCost(laborCost);
        cost.setScrapCost(scrapCost);
        cost.setOtherCost(otherCost);
        cost.setTotalCost(totalCost);
        cost.setUnitCost(unitCost);
        cost.setCalculationTime(LocalDateTime.now());
        cost.setStatus("COMPLETED");

        save(cost);

        return cost;
    }

    private BigDecimal calculateMaterialCost(Long workOrderId) {
        List<WorkOrderMaterial> materials = workOrderMaterialService.lambdaQuery()
                .eq(WorkOrderMaterial::getWorkOrderId, workOrderId)
                .eq(WorkOrderMaterial::getStatus, "PICKED")
                .list();

        return materials.stream()
                .map(m -> m.getTotalPrice() != null ? m.getTotalPrice() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calculateToolCost(Long workOrderId) {
        List<WorkProcess> processes = workProcessService.lambdaQuery()
                .eq(WorkProcess::getWorkOrderId, workOrderId)
                .eq(WorkProcess::getStatus, "COMPLETED")
                .list();

        return processes.stream()
                .map(p -> p.getToolCost() != null ? p.getToolCost() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calculateMachineCost(Long workOrderId) {
        List<WorkProcess> processes = workProcessService.lambdaQuery()
                .eq(WorkProcess::getWorkOrderId, workOrderId)
                .eq(WorkProcess::getStatus, "COMPLETED")
                .list();

        return processes.stream()
                .map(p -> p.getMachineCost() != null ? p.getMachineCost() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calculateLaborCost(Long workOrderId) {
        List<WorkProcess> processes = workProcessService.lambdaQuery()
                .eq(WorkProcess::getWorkOrderId, workOrderId)
                .eq(WorkProcess::getStatus, "COMPLETED")
                .list();

        return processes.stream()
                .map(p -> {
                    if (p.getLaborHours() == null) return BigDecimal.ZERO;
                    BigDecimal hourlyRate = new BigDecimal("50");
                    return p.getLaborHours().multiply(hourlyRate);
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calculateScrapCost(Long workOrderId) {
        List<QualityInspection> inspections = qualityInspectionService.lambdaQuery()
                .eq(QualityInspection::getWorkOrderId, workOrderId)
                .eq(QualityInspection::getResult, "PASS")
                .list();

        return inspections.stream()
                .map(i -> {
                    if (i.getScrapQuantity() == null) return BigDecimal.ZERO;
                    BigDecimal unitMaterialCost = getUnitMaterialCost(workOrderId);
                    return new BigDecimal(i.getScrapQuantity()).multiply(unitMaterialCost);
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal getUnitMaterialCost(Long workOrderId) {
        BigDecimal materialCost = calculateMaterialCost(workOrderId);
        WorkOrder workOrder = workOrderService.getById(workOrderId);
        if (workOrder == null || workOrder.getQuantity() == 0) {
            return BigDecimal.ZERO;
        }
        return materialCost.divide(
                new BigDecimal(workOrder.getQuantity()),
                4,
                RoundingMode.HALF_UP
        );
    }

    @Cacheable(value = "costStatistics", key = "#startDate + '_' + #endDate", unless = "#result == null")
    public CostStatisticsDTO getCostStatistics(LocalDate startDate, LocalDate endDate) {
        List<CostAccounting> costs = lambdaQuery()
                .ge(CostAccounting::getCalculationTime, startDate.atStartOfDay())
                .le(CostAccounting::getCalculationTime, endDate.atTime(23, 59, 59))
                .eq(CostAccounting::getStatus, "COMPLETED")
                .list();

        CostStatisticsDTO dto = new CostStatisticsDTO();
        dto.setStartDate(startDate);
        dto.setEndDate(endDate);
        dto.setOrderCount(costs.size());

        int totalQuantity = costs.stream()
                .mapToInt(CostAccounting::getQuantity)
                .sum();
        dto.setTotalQuantity(totalQuantity);

        BigDecimal totalMaterialCost = costs.stream()
                .map(CostAccounting::getMaterialCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        dto.setTotalMaterialCost(totalMaterialCost);

        BigDecimal totalToolCost = costs.stream()
                .map(CostAccounting::getToolCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        dto.setTotalToolCost(totalToolCost);

        BigDecimal totalMachineCost = costs.stream()
                .map(CostAccounting::getMachineCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        dto.setTotalMachineCost(totalMachineCost);

        BigDecimal totalLaborCost = costs.stream()
                .map(CostAccounting::getLaborCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        dto.setTotalLaborCost(totalLaborCost);

        BigDecimal totalScrapCost = costs.stream()
                .map(CostAccounting::getScrapCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        dto.setTotalScrapCost(totalScrapCost);

        BigDecimal totalOtherCost = costs.stream()
                .map(CostAccounting::getOtherCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        dto.setTotalOtherCost(totalOtherCost);

        BigDecimal totalCost = totalMaterialCost
                .add(totalToolCost)
                .add(totalMachineCost)
                .add(totalLaborCost)
                .add(totalScrapCost)
                .add(totalOtherCost);
        dto.setTotalCost(totalCost);

        if (totalQuantity > 0) {
            dto.setAverageUnitCost(totalCost.divide(
                    new BigDecimal(totalQuantity),
                    4,
                    RoundingMode.HALF_UP
            ));
        } else {
            dto.setAverageUnitCost(BigDecimal.ZERO);
        }

        Map<String, BigDecimal> costBreakdown = new HashMap<>();
        if (totalCost.compareTo(BigDecimal.ZERO) > 0) {
            costBreakdown.put("materialCost", totalMaterialCost.multiply(new BigDecimal("100"))
                    .divide(totalCost, 2, RoundingMode.HALF_UP));
            costBreakdown.put("toolCost", totalToolCost.multiply(new BigDecimal("100"))
                    .divide(totalCost, 2, RoundingMode.HALF_UP));
            costBreakdown.put("machineCost", totalMachineCost.multiply(new BigDecimal("100"))
                    .divide(totalCost, 2, RoundingMode.HALF_UP));
            costBreakdown.put("laborCost", totalLaborCost.multiply(new BigDecimal("100"))
                    .divide(totalCost, 2, RoundingMode.HALF_UP));
            costBreakdown.put("scrapCost", totalScrapCost.multiply(new BigDecimal("100"))
                    .divide(totalCost, 2, RoundingMode.HALF_UP));
        }
        dto.setCostBreakdown(costBreakdown);

        return dto;
    }

    public Page<CostAccounting> listPage(int pageNum, int pageSize, String status) {
        Page<CostAccounting> page = new Page<>(pageNum, pageSize);
        return lambdaQuery()
                .eq(status != null && !status.isEmpty(), CostAccounting::getStatus, status)
                .orderByDesc(CostAccounting::getCalculationTime)
                .page(page);
    }

    public CostAccounting getByWorkOrderId(Long workOrderId) {
        return lambdaQuery()
                .eq(CostAccounting::getWorkOrderId, workOrderId)
                .one();
    }

    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = "costStatistics", allEntries = true)
    public boolean recalculateCost(Long workOrderId) {
        CostAccounting existing = lambdaQuery()
                .eq(CostAccounting::getWorkOrderId, workOrderId)
                .one();
        if (existing != null) {
            removeById(existing.getId());
        }
        calculateCost(workOrderId);
        return true;
    }
}
