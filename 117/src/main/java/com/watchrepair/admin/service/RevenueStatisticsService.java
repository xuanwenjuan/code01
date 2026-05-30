package com.watchrepair.admin.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.watchrepair.admin.common.PageQuery;
import com.watchrepair.admin.entity.RevenueStatistics;
import com.watchrepair.admin.entity.RepairWorkOrder;
import com.watchrepair.admin.entity.WatchCategory;
import com.watchrepair.admin.enums.WorkOrderStatusEnum;
import com.watchrepair.admin.mapper.RevenueStatisticsMapper;
import com.watchrepair.admin.mapper.RepairWorkOrderMapper;
import com.watchrepair.admin.mapper.WatchCategoryMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class RevenueStatisticsService {

    private final RevenueStatisticsMapper statisticsMapper;
    private final RepairWorkOrderMapper workOrderMapper;
    private final WatchCategoryMapper categoryMapper;

    public Page<RevenueStatistics> getStatisticsPage(PageQuery pageQuery, Long categoryId, String statisticsMonth) {
        Page<RevenueStatistics> page = new Page<>(pageQuery.getPageNum(), pageQuery.getPageSize());

        LambdaQueryWrapper<RevenueStatistics> wrapper = new LambdaQueryWrapper<>();
        if (categoryId != null) {
            wrapper.eq(RevenueStatistics::getCategoryId, categoryId);
        }
        if (statisticsMonth != null && !statisticsMonth.isEmpty()) {
            wrapper.apply("DATE_FORMAT(statistics_date, '%Y-%m') = {0}", statisticsMonth);
        }
        wrapper.orderByDesc(RevenueStatistics::getStatisticsDate);

        return statisticsMapper.selectPage(page, wrapper);
    }

    @Transactional(rollbackFor = Exception.class)
    public void generateDailyStatistics(LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(23, 59, 59);

        List<WatchCategory> categories = categoryMapper.selectList(null);

        statisticsMapper.delete(
                new LambdaQueryWrapper<RevenueStatistics>().eq(RevenueStatistics::getStatisticsDate, date)
        );

        for (WatchCategory category : categories) {
            List<RepairWorkOrder> orders = workOrderMapper.selectList(
                    new LambdaQueryWrapper<RepairWorkOrder>()
                            .eq(RepairWorkOrder::getCategoryId, category.getId())
                            .eq(RepairWorkOrder::getStatus, WorkOrderStatusEnum.COMPLETED.getCode())
                            .between(RepairWorkOrder::getCompletedTime, startOfDay, endOfDay)
            );

            if (orders.isEmpty()) {
                continue;
            }

            BigDecimal partsCostTotal = BigDecimal.ZERO;
            BigDecimal laborCostTotal = BigDecimal.ZERO;
            BigDecimal appearanceCostTotal = BigDecimal.ZERO;
            BigDecimal totalRevenue = BigDecimal.ZERO;

            for (RepairWorkOrder order : orders) {
                partsCostTotal = partsCostTotal.add(order.getPartsCost());
                laborCostTotal = laborCostTotal.add(order.getLaborCost());
                appearanceCostTotal = appearanceCostTotal.add(order.getAppearanceCost());
                totalRevenue = totalRevenue.add(order.getTotalAmount());
            }

            RevenueStatistics statistics = new RevenueStatistics();
            statistics.setCategoryId(category.getId());
            statistics.setCategoryName(category.getCategoryName());
            statistics.setStatisticsDate(date);
            statistics.setOrderCount(orders.size());
            statistics.setPartsCostTotal(partsCostTotal);
            statistics.setLaborCostTotal(laborCostTotal);
            statistics.setAppearanceCostTotal(appearanceCostTotal);
            statistics.setConsignmentProfit(BigDecimal.ZERO);
            statistics.setTotalRevenue(totalRevenue);

            statisticsMapper.insert(statistics);
        }
    }

    public Map<String, Object> getMonthlySummary(String month) {
        YearMonth yearMonth = YearMonth.parse(month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();

        List<RevenueStatistics> statistics = statisticsMapper.selectList(
                new LambdaQueryWrapper<RevenueStatistics>()
                        .between(RevenueStatistics::getStatisticsDate, startDate, endDate)
        );

        Map<String, Object> summary = new HashMap<>();
        int totalOrders = 0;
        BigDecimal partsCostTotal = BigDecimal.ZERO;
        BigDecimal laborCostTotal = BigDecimal.ZERO;
        BigDecimal appearanceCostTotal = BigDecimal.ZERO;
        BigDecimal totalRevenue = BigDecimal.ZERO;

        for (RevenueStatistics stat : statistics) {
            totalOrders += stat.getOrderCount();
            partsCostTotal = partsCostTotal.add(stat.getPartsCostTotal());
            laborCostTotal = laborCostTotal.add(stat.getLaborCostTotal());
            appearanceCostTotal = appearanceCostTotal.add(stat.getAppearanceCostTotal());
            totalRevenue = totalRevenue.add(stat.getTotalRevenue());
        }

        summary.put("totalOrders", totalOrders);
        summary.put("partsCostTotal", partsCostTotal);
        summary.put("laborCostTotal", laborCostTotal);
        summary.put("appearanceCostTotal", appearanceCostTotal);
        summary.put("totalRevenue", totalRevenue);
        summary.put("statisticsMonth", month);

        return summary;
    }

    public List<RevenueStatistics> getCategoryStatistics(String month) {
        YearMonth yearMonth = YearMonth.parse(month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();

        return statisticsMapper.selectList(
                new LambdaQueryWrapper<RevenueStatistics>()
                        .between(RevenueStatistics::getStatisticsDate, startDate, endDate)
        );
    }

    public Map<String, Object> getDateRangeSummary(LocalDate startDate, LocalDate endDate, Long categoryId) {
        LambdaQueryWrapper<RevenueStatistics> wrapper = new LambdaQueryWrapper<>();
        wrapper.between(RevenueStatistics::getStatisticsDate, startDate, endDate);
        if (categoryId != null) {
            wrapper.eq(RevenueStatistics::getCategoryId, categoryId);
        }

        List<RevenueStatistics> statistics = statisticsMapper.selectList(wrapper);

        Map<String, Object> summary = new HashMap<>();
        int totalOrders = 0;
        BigDecimal partsCostTotal = BigDecimal.ZERO;
        BigDecimal laborCostTotal = BigDecimal.ZERO;
        BigDecimal appearanceCostTotal = BigDecimal.ZERO;
        BigDecimal totalRevenue = BigDecimal.ZERO;

        for (RevenueStatistics stat : statistics) {
            totalOrders += stat.getOrderCount();
            partsCostTotal = partsCostTotal.add(stat.getPartsCostTotal());
            laborCostTotal = laborCostTotal.add(stat.getLaborCostTotal());
            appearanceCostTotal = appearanceCostTotal.add(stat.getAppearanceCostTotal());
            totalRevenue = totalRevenue.add(stat.getTotalRevenue());
        }

        summary.put("totalOrders", totalOrders);
        summary.put("partsCostTotal", partsCostTotal);
        summary.put("laborCostTotal", laborCostTotal);
        summary.put("appearanceCostTotal", appearanceCostTotal);
        summary.put("totalRevenue", totalRevenue);
        summary.put("startDate", startDate);
        summary.put("endDate", endDate);

        return summary;
    }
}