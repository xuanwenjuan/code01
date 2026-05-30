package com.stationery.manufacture.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.stationery.manufacture.common.BusinessException;
import com.stationery.manufacture.common.ErrorCode;
import com.stationery.manufacture.entity.CostStatistics;
import com.stationery.manufacture.entity.OrderMaterial;
import com.stationery.manufacture.entity.OrderProcess;
import com.stationery.manufacture.entity.ProductionOrder;
import com.stationery.manufacture.mapper.CostStatisticsMapper;
import com.stationery.manufacture.mapper.OrderMaterialMapper;
import com.stationery.manufacture.mapper.OrderProcessMapper;
import com.stationery.manufacture.mapper.ProductionLossMapper;
import com.stationery.manufacture.mapper.ProductionOrderMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class CostBusinessService {

    private final CostStatisticsMapper costMapper;
    private final ProductionOrderMapper orderMapper;
    private final OrderMaterialMapper materialMapper;
    private final OrderProcessMapper processMapper;
    private final ProductionLossMapper lossMapper;

    private static final BigDecimal EQUIPMENT_RATE = new BigDecimal("50");
    private static final BigDecimal LABOR_RATE = new BigDecimal("80");
    private static final BigDecimal DEFECTIVE_COST_RATE = new BigDecimal("1.2");

    public CostBusinessService(CostStatisticsMapper costMapper,
                               ProductionOrderMapper orderMapper,
                               OrderMaterialMapper materialMapper,
                               OrderProcessMapper processMapper,
                               ProductionLossMapper lossMapper) {
        this.costMapper = costMapper;
        this.orderMapper = orderMapper;
        this.materialMapper = materialMapper;
        this.processMapper = processMapper;
        this.lossMapper = lossMapper;
    }

    @Transactional(rollbackFor = Exception.class)
    public CostStatistics calculateOrderCost(Long orderId) {
        ProductionOrder order = orderMapper.selectById(orderId);
        if (order == null) {
            throw new BusinessException(ErrorCode.DATA_NOT_EXISTS);
        }
        if (order.getOrderStatus() < 4) {
            throw new BusinessException("生产未完成，暂无法核算成本");
        }

        CostStatistics existing = costMapper.selectOne(new LambdaQueryWrapper<CostStatistics>()
                .eq(CostStatistics::getOrderId, orderId));
        if (existing != null) {
            costMapper.deleteById(existing.getId());
        }

        List<OrderMaterial> materials = materialMapper.selectList(
                new LambdaQueryWrapper<OrderMaterial>().eq(OrderMaterial::getOrderId, orderId));
        List<OrderProcess> processes = processMapper.selectList(
                new LambdaQueryWrapper<OrderProcess>().eq(OrderProcess::getOrderId, orderId));

        BigDecimal materialCost = materials.stream()
                .map(m -> Optional.ofNullable(m.getActualQuantity()).orElse(BigDecimal.ZERO)
                        .multiply(Optional.ofNullable(m.getUnitPrice()).orElse(BigDecimal.ZERO)))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalHours = processes.stream()
                .map(p -> Optional.ofNullable(p.getWorkingHours()).orElse(BigDecimal.ZERO))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal equipmentCost = totalHours.multiply(EQUIPMENT_RATE);
        BigDecimal laborCost = totalHours.multiply(LABOR_RATE);

        BigDecimal productionLossAmount = lossMapper.sumLossAmountByOrder(orderId);
        BigDecimal reworkCost = productionLossAmount;

        BigDecimal defectiveRate = order.getDefectiveQuantity() != null && order.getDefectiveQuantity() > 0
                ? new BigDecimal(order.getDefectiveQuantity())
                .divide(new BigDecimal(order.getQuantity()), 6, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
        BigDecimal defectiveCost = materialCost.multiply(defectiveRate).multiply(DEFECTIVE_COST_RATE);

        BigDecimal totalCost = materialCost.add(equipmentCost)
                .add(laborCost).add(reworkCost).add(defectiveCost);
        BigDecimal unitCost = totalCost.divide(new BigDecimal(order.getQuantity()), 4, RoundingMode.HALF_UP);

        CostStatistics cost = new CostStatistics();
        cost.setOrderId(orderId);
        cost.setOrderNo(order.getOrderNo());
        cost.setProductName(order.getProductName());
        cost.setQuantity(order.getQuantity());
        cost.setMaterialCost(materialCost);
        cost.setEquipmentCost(equipmentCost);
        cost.setLaborCost(laborCost);
        cost.setReworkCost(reworkCost);
        cost.setDefectiveCost(defectiveCost);
        cost.setTotalCost(totalCost);
        cost.setUnitCost(unitCost);
        cost.setPeriod(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM")));
        cost.setCreateTime(LocalDateTime.now());
        cost.setUpdateTime(LocalDateTime.now());

        costMapper.insert(cost);
        return cost;
    }

    public Map<String, Object> getCostSummary(LocalDateTime startTime, LocalDateTime endTime) {
        List<CostStatistics> costs = costMapper.selectList(new LambdaQueryWrapper<CostStatistics>()
                .ge(CostStatistics::getCreateTime, startTime)
                .le(CostStatistics::getCreateTime, endTime));

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalOrders", costs.size());
        summary.put("totalQuantity", costs.stream()
                .mapToInt(CostStatistics::getQuantity).sum());
        summary.put("totalMaterialCost", costs.stream()
                .map(CostStatistics::getMaterialCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add));
        summary.put("totalEquipmentCost", costs.stream()
                .map(CostStatistics::getEquipmentCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add));
        summary.put("totalLaborCost", costs.stream()
                .map(CostStatistics::getLaborCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add));
        summary.put("totalDefectiveCost", costs.stream()
                .map(CostStatistics::getDefectiveCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add));
        summary.put("totalCost", costs.stream()
                .map(CostStatistics::getTotalCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add));

        if (!costs.isEmpty()) {
            BigDecimal totalCost = (BigDecimal) summary.get("totalCost");
            int totalQuantity = (int) summary.get("totalQuantity");
            summary.put("avgUnitCost", totalCost.divide(new BigDecimal(totalQuantity), 4, RoundingMode.HALF_UP));
        } else {
            summary.put("avgUnitCost", BigDecimal.ZERO);
        }

        return summary;
    }

    public List<Map<String, Object>> getCategoryCostAnalysis(LocalDateTime startTime, LocalDateTime endTime) {
        return costMapper.getCategoryCostReport(startTime, endTime);
    }

    public List<Map<String, Object>> getMonthlyTrend(int months) {
        List<Map<String, Object>> result = new ArrayList<>();
        LocalDate now = LocalDate.now();

        for (int i = months - 1; i >= 0; i--) {
            LocalDate monthDate = now.minusMonths(i);
            String period = monthDate.format(DateTimeFormatter.ofPattern("yyyy-MM"));

            List<CostStatistics> monthCosts = costMapper.selectList(new LambdaQueryWrapper<CostStatistics>()
                    .eq(CostStatistics::getPeriod, period));

            Map<String, Object> item = new HashMap<>();
            item.put("period", period);
            item.put("orderCount", monthCosts.size());
            item.put("totalCost", monthCosts.stream()
                    .map(CostStatistics::getTotalCost)
                    .reduce(BigDecimal.ZERO, BigDecimal::add));
            item.put("materialCost", monthCosts.stream()
                    .map(CostStatistics::getMaterialCost)
                    .reduce(BigDecimal.ZERO, BigDecimal::add));
            item.put("laborCost", monthCosts.stream()
                    .map(CostStatistics::getLaborCost)
                    .reduce(BigDecimal.ZERO, BigDecimal::add));
            item.put("equipmentCost", monthCosts.stream()
                    .map(CostStatistics::getEquipmentCost)
                    .reduce(BigDecimal.ZERO, BigDecimal::add));
            result.add(item);
        }

        return result;
    }

    public Map<String, Object> getCostStructure(Long orderId) {
        CostStatistics cost = costMapper.selectOne(new LambdaQueryWrapper<CostStatistics>()
                .eq(CostStatistics::getOrderId, orderId));
        if (cost == null) {
            throw new BusinessException(ErrorCode.DATA_NOT_EXISTS);
        }

        Map<String, Object> structure = new LinkedHashMap<>();
        BigDecimal total = cost.getTotalCost();

        structure.put("materialCost", cost.getMaterialCost());
        structure.put("materialRatio", total.compareTo(BigDecimal.ZERO) > 0
                ? cost.getMaterialCost().multiply(new BigDecimal("100"))
                .divide(total, 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO);

        structure.put("laborCost", cost.getLaborCost());
        structure.put("laborRatio", total.compareTo(BigDecimal.ZERO) > 0
                ? cost.getLaborCost().multiply(new BigDecimal("100"))
                .divide(total, 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO);

        structure.put("equipmentCost", cost.getEquipmentCost());
        structure.put("equipmentRatio", total.compareTo(BigDecimal.ZERO) > 0
                ? cost.getEquipmentCost().multiply(new BigDecimal("100"))
                .divide(total, 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO);

        structure.put("defectiveCost", cost.getDefectiveCost());
        structure.put("defectiveRatio", total.compareTo(BigDecimal.ZERO) > 0
                ? cost.getDefectiveCost().multiply(new BigDecimal("100"))
                .divide(total, 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO);

        structure.put("totalCost", total);
        structure.put("unitCost", cost.getUnitCost());

        return structure;
    }

    public List<Map<String, Object>> getFinancialData(LocalDateTime startTime, LocalDateTime endTime) {
        List<CostStatistics> costs = costMapper.selectList(new LambdaQueryWrapper<CostStatistics>()
                .ge(CostStatistics::getCreateTime, startTime)
                .le(CostStatistics::getCreateTime, endTime));

        List<Map<String, Object>> result = new ArrayList<>();
        for (CostStatistics cost : costs) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("orderNo", cost.getOrderNo());
            item.put("productName", cost.getProductName());
            item.put("quantity", cost.getQuantity());
            item.put("materialCost", cost.getMaterialCost());
            item.put("laborCost", cost.getLaborCost());
            item.put("equipmentCost", cost.getEquipmentCost());
            item.put("defectiveCost", cost.getDefectiveCost());
            item.put("totalCost", cost.getTotalCost());
            item.put("unitCost", cost.getUnitCost());
            item.put("createTime", cost.getCreateTime());
            result.add(item);
        }
        return result;
    }

    public List<Map<String, Object>> getMaterialUsageReport(LocalDateTime startTime, LocalDateTime endTime) {
        List<OrderMaterial> materials = materialMapper.selectList(new LambdaQueryWrapper<OrderMaterial>()
                .ge(OrderMaterial::getCreateTime, startTime)
                .le(OrderMaterial::getCreateTime, endTime));

        Map<String, Map<String, Object>> summary = new LinkedHashMap<>();
        for (OrderMaterial mat : materials) {
            String key = mat.getMaterialCode() + "_" + mat.getMaterialName();
            Map<String, Object> item = summary.computeIfAbsent(key, k -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("materialCode", mat.getMaterialCode());
                m.put("materialName", mat.getMaterialName());
                m.put("specification", mat.getSpecification());
                m.put("unit", mat.getUnit());
                m.put("totalQuantity", BigDecimal.ZERO);
                m.put("totalAmount", BigDecimal.ZERO);
                m.put("usageCount", 0);
                return m;
            });

            item.put("totalQuantity", ((BigDecimal) item.get("totalQuantity"))
                    .add(Optional.ofNullable(mat.getActualQuantity()).orElse(BigDecimal.ZERO)));
            item.put("totalAmount", ((BigDecimal) item.get("totalAmount"))
                    .add(Optional.ofNullable(mat.getTotalPrice()).orElse(BigDecimal.ZERO)));
            item.put("usageCount", (int) item.get("usageCount") + 1);
        }

        return new ArrayList<>(summary.values());
    }

    public Map<String, Object> getCostDashboard() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime monthStart = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime lastMonthStart = monthStart.minusMonths(1);

        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("currentMonth", getCostSummary(monthStart, now));
        dashboard.put("lastMonth", getCostSummary(lastMonthStart, monthStart.minusNanos(1)));
        dashboard.put("monthlyTrend", getMonthlyTrend(6));
        return dashboard;
    }
}
