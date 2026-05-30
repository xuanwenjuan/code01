package com.valve.manufacture.service;

import cn.hutool.core.util.IdUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.valve.manufacture.entity.ProductionCost;
import com.valve.manufacture.entity.ProductionLoss;
import com.valve.manufacture.entity.WorkOrder;
import com.valve.manufacture.entity.WorkOrderMaterial;
import com.valve.manufacture.entity.WorkOrderProcess;
import com.valve.manufacture.exception.BusinessException;
import com.valve.manufacture.mapper.ProductionCostMapper;
import com.valve.manufacture.util.RedisUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class ProductionCostService extends ServiceImpl<ProductionCostMapper, ProductionCost> {

    private final WorkOrderService workOrderService;
    private final WorkOrderMaterialService workOrderMaterialService;
    private final WorkOrderProcessService workOrderProcessService;
    private final ProductionLossService productionLossService;
    private final RedisUtil redisUtil;
    private static final String COST_CACHE_KEY = "productionCost:";
    private static final String COST_STATISTICS_CACHE_KEY = "productionCost:statistics:";

    private static final BigDecimal HOURLY_LABOR_RATE = new BigDecimal("80");
    private static final BigDecimal HOURLY_EQUIPMENT_RATE = new BigDecimal("50");
    private static final BigDecimal DEFAULT_TOOL_WEAR_RATE = new BigDecimal("0.05");
    private static final BigDecimal DEFAULT_ENERGY_RATE = new BigDecimal("0.03");
    private static final BigDecimal MATERIAL_LOSS_RATE = new BigDecimal("0.02");

    @Transactional(rollbackFor = Exception.class)
    public ProductionCost calculate(Long workOrderId, Long operatorId) {
        WorkOrder workOrder = workOrderService.getById(workOrderId);
        if (workOrder == null) {
            throw new BusinessException("工单不存在");
        }
        if (!"FINISHED".equals(workOrder.getStatus())) {
            throw new BusinessException("工单未完成，暂不能核算成本");
        }

        ProductionCost existCost = getOne(new LambdaQueryWrapper<ProductionCost>()
                .eq(ProductionCost::getWorkOrderId, workOrderId)
                .eq(ProductionCost::getDeleted, 0));

        ProductionCost cost;
        if (existCost != null) {
            if (existCost.getStatus() == 1) {
                throw new BusinessException("成本已确认，不能重新计算");
            }
            cost = existCost;
        } else {
            cost = new ProductionCost();
            cost.setCostNo(generateCostNo());
            cost.setWorkOrderId(workOrderId);
            cost.setStatus(0);
        }

        BigDecimal materialCost = calculateMaterialCost(workOrderId);
        cost.setMaterialCost(materialCost);

        BigDecimal laborCost = calculateLaborCost(workOrderId);
        cost.setLaborCost(laborCost);

        BigDecimal equipmentCost = calculateEquipmentCost(workOrderId);
        cost.setEquipmentCost(equipmentCost);

        autoCollectLosses(workOrderId, operatorId);

        BigDecimal lossCost = productionLossService.calculateTotalLossAmount(workOrderId);
        cost.setScrapCost(lossCost);

        BigDecimal toolCost = calculateToolCost(workOrderId);
        cost.setToolCost(toolCost);

        BigDecimal energyCost = calculateEnergyCost(workOrderId);
        cost.setEnergyCost(energyCost);

        BigDecimal totalCost = cost.getMaterialCost()
                .add(cost.getToolCost())
                .add(cost.getEquipmentCost())
                .add(cost.getLaborCost())
                .add(cost.getScrapCost())
                .add(cost.getEnergyCost() != null ? cost.getEnergyCost() : BigDecimal.ZERO);
        cost.setTotalCost(totalCost);

        if (workOrder.getQuantity() != null && workOrder.getQuantity() > 0) {
            cost.setUnitCost(totalCost.divide(new BigDecimal(workOrder.getQuantity()), 2, RoundingMode.HALF_UP));
        }

        if (existCost != null) {
            updateById(cost);
        } else {
            save(cost);
        }

        clearCostCache(cost.getId());
        clearStatisticsCache();
        return getDetail(cost.getId());
    }

    @Transactional(rollbackFor = Exception.class)
    public List<ProductionLoss> autoCollectLosses(Long workOrderId, Long operatorId) {
        List<WorkOrderProcess> processes = workOrderProcessService.getByWorkOrderId(workOrderId);
        List<ProductionLoss> existingLosses = productionLossService.getByWorkOrderId(workOrderId);
        List<Long> existingProcessIds = existingLosses.stream()
                .map(ProductionLoss::getProcessId)
                .filter(id -> id != null)
                .toList();

        for (WorkOrderProcess process : processes) {
            if (existingProcessIds.contains(process.getId())) {
                continue;
            }
            if (process.getWorkHours() == null || process.getWorkHours().compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }

            ProductionLoss loss = new ProductionLoss();
            loss.setWorkOrderId(workOrderId);
            loss.setProcessId(process.getId());
            loss.setLossType("AUTO");
            loss.setOperatorId(operatorId);

            BigDecimal baseAmount = process.getWorkHours().multiply(HOURLY_LABOR_RATE);

            loss.setToolWearCost(baseAmount.multiply(DEFAULT_TOOL_WEAR_RATE));
            loss.setEnergyCost(baseAmount.multiply(DEFAULT_ENERGY_RATE));

            BigDecimal totalLoss = loss.getToolWearCost().add(loss.getEnergyCost());
            loss.setLossAmount(totalLoss);

            productionLossService.recordLoss(loss);
        }

        autoCollectMaterialLosses(workOrderId, operatorId);

        return productionLossService.getByWorkOrderId(workOrderId);
    }

    private void autoCollectMaterialLosses(Long workOrderId, Long operatorId) {
        List<WorkOrderMaterial> materials = workOrderMaterialService.getByWorkOrderId(workOrderId);
        for (WorkOrderMaterial material : materials) {
            if (material.getQuantity() != null && material.getUnitPrice() != null) {
                BigDecimal lossQuantity = material.getQuantity().multiply(MATERIAL_LOSS_RATE);
                BigDecimal lossAmount = lossQuantity.multiply(material.getUnitPrice());

                ProductionLoss loss = new ProductionLoss();
                loss.setWorkOrderId(workOrderId);
                loss.setMaterialId(material.getMaterialId());
                loss.setLossType("MATERIAL");
                loss.setLossQuantity(lossQuantity);
                loss.setUnitPrice(material.getUnitPrice());
                loss.setLossAmount(lossAmount);
                loss.setOperatorId(operatorId);

                productionLossService.recordLoss(loss);
            }
        }
    }

    private BigDecimal calculateToolCost(Long workOrderId) {
        List<ProductionLoss> losses = productionLossService.getByWorkOrderId(workOrderId);
        return losses.stream()
                .map(l -> l.getToolWearCost() != null ? l.getToolWearCost() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calculateEnergyCost(Long workOrderId) {
        List<ProductionLoss> losses = productionLossService.getByWorkOrderId(workOrderId);
        return losses.stream()
                .map(l -> l.getEnergyCost() != null ? l.getEnergyCost() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calculateMaterialCost(Long workOrderId) {
        List<WorkOrderMaterial> materials = workOrderMaterialService.getByWorkOrderId(workOrderId);
        return materials.stream()
                .map(m -> {
                    if (m.getTotalPrice() != null) {
                        return m.getTotalPrice();
                    }
                    if (m.getUnitPrice() != null && m.getQuantity() != null) {
                        return m.getUnitPrice().multiply(m.getQuantity());
                    }
                    return BigDecimal.ZERO;
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calculateLaborCost(Long workOrderId) {
        List<WorkOrderProcess> processes = workOrderProcessService.getByWorkOrderId(workOrderId);
        BigDecimal totalHours = processes.stream()
                .map(p -> p.getWorkHours() != null ? p.getWorkHours() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return totalHours.multiply(HOURLY_LABOR_RATE);
    }

    private BigDecimal calculateEquipmentCost(Long workOrderId) {
        List<WorkOrderProcess> processes = workOrderProcessService.getByWorkOrderId(workOrderId);
        BigDecimal totalHours = processes.stream()
                .map(p -> p.getWorkHours() != null ? p.getWorkHours() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return totalHours.multiply(HOURLY_EQUIPMENT_RATE);
    }

    private String generateCostNo() {
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String random = IdUtil.randomUUID().substring(0, 8).toUpperCase();
        return "COST-" + dateStr + "-" + random;
    }

    public ProductionCost getDetail(Long id) {
        String cacheKey = COST_CACHE_KEY + id;
        Object cached = redisUtil.get(cacheKey);
        if (cached != null) {
            return (ProductionCost) cached;
        }

        ProductionCost cost = getById(id);
        if (cost != null) {
            redisUtil.set(cacheKey, cost, 10, TimeUnit.MINUTES);
        }
        return cost;
    }

    @Transactional(rollbackFor = Exception.class)
    public ProductionCost confirm(Long id, Long confirmerId) {
        ProductionCost cost = getById(id);
        if (cost == null) {
            throw new BusinessException("成本记录不存在");
        }
        if (cost.getStatus() == 1) {
            throw new BusinessException("成本已确认");
        }

        cost.setStatus(1);
        cost.setConfirmTime(LocalDateTime.now());
        cost.setConfirmerId(confirmerId);
        updateById(cost);
        clearCostCache(id);
        clearStatisticsCache();
        return getDetail(id);
    }

    @Transactional(rollbackFor = Exception.class)
    public ProductionCost updateCostDetails(Long id, ProductionCost costUpdate) {
        ProductionCost cost = getById(id);
        if (cost == null) {
            throw new BusinessException("成本记录不存在");
        }
        if (cost.getStatus() == 1) {
            throw new BusinessException("已确认的成本不能修改");
        }

        if (costUpdate.getToolCost() != null) cost.setToolCost(costUpdate.getToolCost());
        if (costUpdate.getScrapCost() != null) cost.setScrapCost(costUpdate.getScrapCost());
        if (costUpdate.getEnergyCost() != null) cost.setEnergyCost(costUpdate.getEnergyCost());
        if (costUpdate.getRemark() != null) cost.setRemark(costUpdate.getRemark());

        BigDecimal totalCost = cost.getMaterialCost()
                .add(cost.getToolCost())
                .add(cost.getEquipmentCost())
                .add(cost.getLaborCost())
                .add(cost.getScrapCost())
                .add(cost.getEnergyCost() != null ? cost.getEnergyCost() : BigDecimal.ZERO);
        cost.setTotalCost(totalCost);

        WorkOrder workOrder = workOrderService.getById(cost.getWorkOrderId());
        if (workOrder != null && workOrder.getQuantity() != null && workOrder.getQuantity() > 0) {
            cost.setUnitCost(totalCost.divide(new BigDecimal(workOrder.getQuantity()), 2, RoundingMode.HALF_UP));
        }

        updateById(cost);
        clearCostCache(id);
        clearStatisticsCache();
        return getDetail(id);
    }

    public ProductionCost getByWorkOrderId(Long workOrderId) {
        return getOne(new LambdaQueryWrapper<ProductionCost>()
                .eq(ProductionCost::getWorkOrderId, workOrderId)
                .eq(ProductionCost::getDeleted, 0));
    }

    public Page<ProductionCost> page(Integer current, Integer size,
                                     Long workOrderId,
                                     LocalDate startDate, LocalDate endDate) {
        LambdaQueryWrapper<ProductionCost> wrapper = new LambdaQueryWrapper<>();
        if (workOrderId != null) {
            wrapper.eq(ProductionCost::getWorkOrderId, workOrderId);
        }
        if (startDate != null) {
            wrapper.ge(ProductionCost::getCreateTime, startDate.atStartOfDay());
        }
        if (endDate != null) {
            wrapper.le(ProductionCost::getCreateTime, endDate.atTime(23, 59, 59));
        }
        wrapper.eq(ProductionCost::getDeleted, 0);
        wrapper.orderByDesc(ProductionCost::getCreateTime);

        return page(new Page<>(current, size), wrapper);
    }

    public Map<String, BigDecimal> getStatistics(LocalDate startDate, LocalDate endDate) {
        String cacheKey = COST_STATISTICS_CACHE_KEY + (startDate != null ? startDate : "all") + "-" + (endDate != null ? endDate : "all");
        Object cached = redisUtil.get(cacheKey);
        if (cached != null) {
            return (Map<String, BigDecimal>) cached;
        }

        LambdaQueryWrapper<ProductionCost> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProductionCost::getStatus, 1);
        if (startDate != null) {
            wrapper.ge(ProductionCost::getConfirmTime, startDate.atStartOfDay());
        }
        if (endDate != null) {
            wrapper.le(ProductionCost::getConfirmTime, endDate.atTime(23, 59, 59));
        }
        wrapper.eq(ProductionCost::getDeleted, 0);

        List<ProductionCost> costs = list(wrapper);

        Map<String, BigDecimal> statistics = new HashMap<>();
        statistics.put("totalCost", costs.stream()
                .map(c -> c.getTotalCost() != null ? c.getTotalCost() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add));
        statistics.put("materialCost", costs.stream()
                .map(c -> c.getMaterialCost() != null ? c.getMaterialCost() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add));
        statistics.put("laborCost", costs.stream()
                .map(c -> c.getLaborCost() != null ? c.getLaborCost() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add));
        statistics.put("equipmentCost", costs.stream()
                .map(c -> c.getEquipmentCost() != null ? c.getEquipmentCost() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add));
        statistics.put("toolCost", costs.stream()
                .map(c -> c.getToolCost() != null ? c.getToolCost() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add));
        statistics.put("scrapCost", costs.stream()
                .map(c -> c.getScrapCost() != null ? c.getScrapCost() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add));
        statistics.put("energyCost", costs.stream()
                .map(c -> c.getEnergyCost() != null ? c.getEnergyCost() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add));

        redisUtil.set(cacheKey, statistics, 30, TimeUnit.MINUTES);
        return statistics;
    }

    private void clearCostCache(Long id) {
        if (id != null) {
            redisUtil.delete(COST_CACHE_KEY + id);
        }
    }

    private void clearStatisticsCache() {
        List<String> keys = redisUtil.scan(COST_STATISTICS_CACHE_KEY + "*");
        for (String key : keys) {
            redisUtil.delete(key);
        }
    }

    public BigDecimal calculateMaterialLossRate(Long workOrderId) {
        BigDecimal materialCost = calculateMaterialCost(workOrderId);
        BigDecimal lossCost = productionLossService.calculateTotalLossAmount(workOrderId);

        if (materialCost.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }

        return lossCost.divide(materialCost, 4, RoundingMode.HALF_UP);
    }
}
