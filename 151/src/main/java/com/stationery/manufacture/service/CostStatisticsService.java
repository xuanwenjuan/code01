package com.stationery.manufacture.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.stationery.manufacture.common.BusinessException;
import com.stationery.manufacture.common.ErrorCode;
import com.stationery.manufacture.entity.CostStatistics;
import com.stationery.manufacture.entity.OrderMaterial;
import com.stationery.manufacture.entity.OrderProcess;
import com.stationery.manufacture.entity.ProductionOrder;
import com.stationery.manufacture.mapper.CostStatisticsMapper;
import com.stationery.manufacture.mapper.OrderMaterialMapper;
import com.stationery.manufacture.mapper.OrderProcessMapper;
import com.stationery.manufacture.mapper.ProductionOrderMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
public class CostStatisticsService {

    private final CostStatisticsMapper costMapper;
    private final ProductionOrderMapper orderMapper;
    private final OrderMaterialMapper materialMapper;
    private final OrderProcessMapper processMapper;

    public CostStatisticsService(CostStatisticsMapper costMapper,
                                 ProductionOrderMapper orderMapper,
                                 OrderMaterialMapper materialMapper,
                                 OrderProcessMapper processMapper) {
        this.costMapper = costMapper;
        this.orderMapper = orderMapper;
        this.materialMapper = materialMapper;
        this.processMapper = processMapper;
    }

    @Transactional(rollbackFor = Exception.class)
    public CostStatistics calculateOrderCost(Long orderId) {
        ProductionOrder order = orderMapper.selectById(orderId);
        if (order == null) {
            throw new BusinessException(ErrorCode.DATA_NOT_EXISTS);
        }

        CostStatistics existing = costMapper.selectOne(new LambdaQueryWrapper<CostStatistics>()
                .eq(CostStatistics::getOrderId, orderId));
        if (existing != null) {
            costMapper.deleteById(existing.getId());
        }

        BigDecimal materialCost = costMapper.calculateMaterialCost(orderId);
        BigDecimal equipmentCost = costMapper.calculateEquipmentCost(orderId);
        BigDecimal laborCost = costMapper.calculateLaborCost(orderId);

        BigDecimal reworkCost = BigDecimal.ZERO;
        BigDecimal defectiveRate = order.getDefectiveQuantity() > 0
                ? new BigDecimal(order.getDefectiveQuantity())
                .divide(new BigDecimal(order.getQuantity()), 4, BigDecimal.ROUND_HALF_UP)
                : BigDecimal.ZERO;
        BigDecimal defectiveCost = materialCost.multiply(defectiveRate);

        BigDecimal totalCost = materialCost.add(equipmentCost)
                .add(laborCost).add(reworkCost).add(defectiveCost);
        BigDecimal unitCost = totalCost.divide(new BigDecimal(order.getQuantity()), 4, BigDecimal.ROUND_HALF_UP);

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

    public Page<CostStatistics> getCostPage(Integer pageNum, Integer pageSize,
                                            String orderNo, String productName,
                                            String period) {
        Page<CostStatistics> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<CostStatistics> wrapper = new LambdaQueryWrapper<>();

        if (StringUtils.hasText(orderNo)) {
            wrapper.like(CostStatistics::getOrderNo, orderNo);
        }
        if (StringUtils.hasText(productName)) {
            wrapper.like(CostStatistics::getProductName, productName);
        }
        if (StringUtils.hasText(period)) {
            wrapper.eq(CostStatistics::getPeriod, period);
        }

        wrapper.orderByDesc(CostStatistics::getCreateTime);
        return costMapper.selectPage(page, wrapper);
    }

    public List<Map<String, Object>> getPeriodCostReport(LocalDateTime startTime, LocalDateTime endTime) {
        return costMapper.getPeriodCostReport(startTime, endTime);
    }

    public List<Map<String, Object>> getCategoryCostReport(LocalDateTime startTime, LocalDateTime endTime) {
        return costMapper.getCategoryCostReport(startTime, endTime);
    }

    public CostStatistics getCostById(Long id) {
        return costMapper.selectById(id);
    }

    public List<OrderMaterial> getOrderMaterials(Long orderId) {
        return materialMapper.selectList(new LambdaQueryWrapper<OrderMaterial>()
                .eq(OrderMaterial::getOrderId, orderId));
    }

    public List<OrderProcess> getOrderProcesses(Long orderId) {
        return processMapper.selectList(new LambdaQueryWrapper<OrderProcess>()
                .eq(OrderProcess::getOrderId, orderId)
                .orderByAsc(OrderProcess::getProcessSort));
    }
}
