package com.tarp.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.tarp.entity.CostStatistics;
import com.tarp.entity.WorkOrder;
import com.tarp.mapper.CostStatisticsMapper;
import com.tarp.mapper.WorkOrderMapper;
import com.tarp.vo.PageVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CostStatisticsService {

    private final CostStatisticsMapper costStatisticsMapper;
    private final WorkOrderMapper workOrderMapper;

    public PageVO<CostStatistics> page(int pageNum, int pageSize, LocalDate startDate, LocalDate endDate) {
        Page<CostStatistics> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<CostStatistics> wrapper = new LambdaQueryWrapper<>();
        if (startDate != null) {
            wrapper.ge(CostStatistics::getStatisticsDate, startDate);
        }
        if (endDate != null) {
            wrapper.le(CostStatistics::getStatisticsDate, endDate);
        }
        wrapper.orderByDesc(CostStatistics::getStatisticsDate);
        Page<CostStatistics> result = costStatisticsMapper.selectPage(page, wrapper);
        return new PageVO<>(result.getTotal(), result.getRecords(), pageNum, pageSize);
    }

    public void generateDailyStatistics(LocalDate date) {
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.plusDays(1).atStartOfDay();

        List<WorkOrder> finishedOrders = workOrderMapper.selectList(
                new LambdaQueryWrapper<WorkOrder>()
                        .eq(WorkOrder::getStatus, 6)
                        .between(WorkOrder::getFinishTime, start, end)
        );

        Map<Long, List<WorkOrder>> categoryOrders = finishedOrders.stream()
                .collect(Collectors.groupingBy(WorkOrder::getCategoryId));

        for (Map.Entry<Long, List<WorkOrder>> entry : categoryOrders.entrySet()) {
            Long categoryId = entry.getKey();
            List<WorkOrder> orders = entry.getValue();

            CostStatistics stats = new CostStatistics();
            stats.setCategoryId(categoryId);
            stats.setStatisticsDate(date);
            stats.setTotalOrders(orders.size());
            stats.setTotalQuantity(orders.stream().mapToInt(WorkOrder::getQuantity).sum());

            BigDecimal totalMaterialCost = BigDecimal.ZERO;
            BigDecimal totalLaborCost = BigDecimal.ZERO;
            BigDecimal totalCost = BigDecimal.ZERO;

            for (WorkOrder order : orders) {
                if (order.getMaterialCost() != null) {
                    totalMaterialCost = totalMaterialCost.add(order.getMaterialCost());
                }
                if (order.getLaborCost() != null) {
                    totalLaborCost = totalLaborCost.add(order.getLaborCost());
                }
                if (order.getTotalCost() != null) {
                    totalCost = totalCost.add(order.getTotalCost());
                }
            }

            stats.setMaterialCost(totalMaterialCost);
            stats.setLaborCost(totalLaborCost);
            stats.setTotalCost(totalCost);
            stats.setOilProcessCost(totalMaterialCost.multiply(new BigDecimal("0.1")));

            costStatisticsMapper.insert(stats);
        }
    }

    public List<CostStatistics> getCategoryStatistics(LocalDate startDate, LocalDate endDate) {
        LambdaQueryWrapper<CostStatistics> wrapper = new LambdaQueryWrapper<>();
        if (startDate != null) {
            wrapper.ge(CostStatistics::getStatisticsDate, startDate);
        }
        if (endDate != null) {
            wrapper.le(CostStatistics::getStatisticsDate, endDate);
        }
        return costStatisticsMapper.selectList(wrapper);
    }
}
