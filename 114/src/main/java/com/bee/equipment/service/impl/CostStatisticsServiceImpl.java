package com.bee.equipment.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.bee.equipment.common.Constants;
import com.bee.equipment.entity.CostStatistics;
import com.bee.equipment.entity.WorkOrder;
import com.bee.equipment.entity.WorkOrderMaterial;
import com.bee.equipment.mapper.CostStatisticsMapper;
import com.bee.equipment.service.CostStatisticsService;
import com.bee.equipment.service.WorkOrderMaterialService;
import com.bee.equipment.service.WorkOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CostStatisticsServiceImpl extends ServiceImpl<CostStatisticsMapper, CostStatistics> implements CostStatisticsService {

    @Autowired
    private WorkOrderService workOrderService;

    @Autowired
    private WorkOrderMaterialService workOrderMaterialService;

    @Override
    public Page<CostStatistics> listWithPage(int page, int size, Long categoryId, LocalDate startDate, LocalDate endDate) {
        LambdaQueryWrapper<CostStatistics> wrapper = new LambdaQueryWrapper<>();
        if (categoryId != null) {
            wrapper.eq(CostStatistics::getEquipmentCategoryId, categoryId);
        }
        if (startDate != null) {
            wrapper.ge(CostStatistics::getStatisticsDate, startDate);
        }
        if (endDate != null) {
            wrapper.le(CostStatistics::getStatisticsDate, endDate);
        }
        wrapper.orderByDesc(CostStatistics::getStatisticsDate);
        return page(new Page<>(page, size), wrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void generateStatistics(LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(23, 59, 59);

        List<WorkOrder> finishedOrders = workOrderService.lambdaQuery()
                .eq(WorkOrder::getStatus, Constants.WORK_ORDER_STATUS_DELIVERED)
                .between(WorkOrder::getFinishTime, startOfDay, endOfDay)
                .list();

        lambdaUpdate()
                .eq(CostStatistics::getStatisticsDate, date)
                .remove();

        Map<Long, CostStatistics> categoryStatsMap = new HashMap<>();

        for (WorkOrder order : finishedOrders) {
            Long categoryId = order.getEquipmentCategoryId();
            CostStatistics stats = categoryStatsMap.get(categoryId);
            if (stats == null) {
                stats = new CostStatistics();
                stats.setStatisticsDate(date);
                stats.setEquipmentCategoryId(categoryId);
                stats.setMaterialCost(BigDecimal.ZERO);
                stats.setLaborCost(BigDecimal.ZERO);
                stats.setTransportCost(BigDecimal.ZERO);
                stats.setTotalCost(BigDecimal.ZERO);
                stats.setSalesRevenue(BigDecimal.ZERO);
                stats.setProfit(BigDecimal.ZERO);
                stats.setProductionQuantity(0);
                stats.setCreateTime(LocalDateTime.now());
                categoryStatsMap.put(categoryId, stats);
            }

            List<WorkOrderMaterial> materials = workOrderMaterialService.lambdaQuery()
                    .eq(WorkOrderMaterial::getWorkOrderId, order.getId())
                    .list();

            BigDecimal materialCost = BigDecimal.ZERO;
            for (WorkOrderMaterial m : materials) {
                if (m.getActualQuantity() != null) {
                    materialCost = materialCost.add(m.getActualQuantity().multiply(BigDecimal.valueOf(80)));
                }
            }

            BigDecimal laborCost = BigDecimal.valueOf(order.getQuantity() * 50.0);
            BigDecimal transportCost = BigDecimal.valueOf(order.getQuantity() * 20.0);
            BigDecimal totalCost = materialCost.add(laborCost).add(transportCost);
            BigDecimal salesRevenue = BigDecimal.valueOf(order.getQuantity() * 200.0);
            BigDecimal profit = salesRevenue.subtract(totalCost);

            stats.setMaterialCost(stats.getMaterialCost().add(materialCost));
            stats.setLaborCost(stats.getLaborCost().add(laborCost));
            stats.setTransportCost(stats.getTransportCost().add(transportCost));
            stats.setTotalCost(stats.getTotalCost().add(totalCost));
            stats.setSalesRevenue(stats.getSalesRevenue().add(salesRevenue));
            stats.setProfit(stats.getProfit().add(profit));
            stats.setProductionQuantity(stats.getProductionQuantity() + order.getQuantity());
        }

        for (CostStatistics statistics : categoryStatsMap.values()) {
            save(statistics);
        }
    }
}
