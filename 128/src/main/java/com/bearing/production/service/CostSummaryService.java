package com.bearing.production.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.bearing.production.entity.CostSummary;
import com.bearing.production.entity.WorkOrder;
import com.bearing.production.enums.WorkOrderStatusEnum;
import com.bearing.production.exception.BusinessException;
import com.bearing.production.mapper.CostSummaryMapper;
import com.bearing.production.mapper.WorkOrderMapper;
import com.bearing.production.util.RedisUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class CostSummaryService {

    private final CostSummaryMapper costSummaryMapper;
    private final WorkOrderMapper workOrderMapper;
    private final RedisUtil redisUtil;

    private static final String COST_SUMMARY_KEY = "bearing:costsummary:";

    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = "costSummaryCache", allEntries = true)
    public void generateQuarterlyReport(Integer year, Integer quarter) {
        validateQuarter(quarter);
        
        LocalDateTime startDate = getQuarterStartDate(year, quarter);
        LocalDateTime endDate = getQuarterEndDate(year, quarter);

        LambdaQueryWrapper<WorkOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(WorkOrder::getStatus, WorkOrderStatusEnum.FINISHED.getCode())
                .between(WorkOrder::getActualEndTime, startDate, endDate);

        List<WorkOrder> finishedOrders = workOrderMapper.selectList(wrapper);

        Map<Long, List<WorkOrder>> categoryOrdersMap = new HashMap<>();
        for (WorkOrder order : finishedOrders) {
            if (order.getCategoryId() != null) {
                categoryOrdersMap.computeIfAbsent(order.getCategoryId(), k -> new ArrayList<>()).add(order);
            }
        }

        for (Map.Entry<Long, List<WorkOrder>> entry : categoryOrdersMap.entrySet()) {
            Long categoryId = entry.getKey();
            List<WorkOrder> orders = entry.getValue();

            CostSummary summary = calculateCostSummary(orders, categoryId);
            summary.setReportYear(year);
            summary.setReportQuarter(quarter);

            LambdaQueryWrapper<CostSummary> existWrapper = new LambdaQueryWrapper<>();
            existWrapper.eq(CostSummary::getCategoryId, categoryId)
                    .eq(CostSummary::getReportYear, year)
                    .eq(CostSummary::getReportQuarter, quarter);

            CostSummary existSummary = costSummaryMapper.selectOne(existWrapper);
            if (existSummary != null) {
                summary.setId(existSummary.getId());
                costSummaryMapper.updateById(summary);
                log.info("更新季度报表，品类ID: {}, 年份: {}, 季度: {}", categoryId, year, quarter);
            } else {
                costSummaryMapper.insert(summary);
                log.info("生成季度报表，品类ID: {}, 年份: {}, 季度: {}", categoryId, year, quarter);
            }
        }

        clearCostSummaryCache();
    }

    @Cacheable(value = "costSummaryCache", key = "'report:' + #year + ':' + #quarter + ':' + #categoryId + ':' + #page + ':' + #size")
    public IPage<CostSummary> getQuarterlyReportPage(Integer year, Integer quarter, Long categoryId, int page, int size) {
        LambdaQueryWrapper<CostSummary> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(year != null, CostSummary::getReportYear, year);
        wrapper.eq(quarter != null, CostSummary::getReportQuarter, quarter);
        wrapper.eq(categoryId != null, CostSummary::getCategoryId, categoryId);
        wrapper.orderByDesc(CostSummary::getReportYear)
                .orderByDesc(CostSummary::getReportQuarter);
        return costSummaryMapper.selectPage(new Page<>(page, size), wrapper);
    }

    public List<CostSummary> getQuarterlyReport(Integer year, Integer quarter, Long categoryId) {
        LambdaQueryWrapper<CostSummary> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(year != null, CostSummary::getReportYear, year);
        wrapper.eq(quarter != null, CostSummary::getReportQuarter, quarter);
        wrapper.eq(categoryId != null, CostSummary::getCategoryId, categoryId);
        wrapper.orderByDesc(CostSummary::getReportYear)
                .orderByDesc(CostSummary::getReportQuarter);
        return costSummaryMapper.selectList(wrapper);
    }

    public List<WorkOrder> getWorkOrderDetails(Long categoryId, Integer year, Integer quarter) {
        validateQuarter(quarter);
        
        LocalDateTime startDate = getQuarterStartDate(year, quarter);
        LocalDateTime endDate = getQuarterEndDate(year, quarter);

        LambdaQueryWrapper<WorkOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(categoryId != null, WorkOrder::getCategoryId, categoryId);
        wrapper.eq(WorkOrder::getStatus, WorkOrderStatusEnum.FINISHED.getCode());
        wrapper.between(WorkOrder::getActualEndTime, startDate, endDate);
        wrapper.orderByDesc(WorkOrder::getActualEndTime);

        return workOrderMapper.selectList(wrapper);
    }

    public CostSummary getById(Long id) {
        String cacheKey = COST_SUMMARY_KEY + id;
        
        if (redisUtil.hasKey(cacheKey)) {
            return (CostSummary) redisUtil.get(cacheKey);
        }
        
        CostSummary summary = costSummaryMapper.selectById(id);
        if (summary != null) {
            redisUtil.set(cacheKey, summary, 1, TimeUnit.HOURS);
        }
        return summary;
    }

    private CostSummary calculateCostSummary(List<WorkOrder> orders, Long categoryId) {
        CostSummary summary = new CostSummary();
        summary.setCategoryId(categoryId);

        if (!orders.isEmpty()) {
            summary.setCategoryName(orders.get(0).getCategoryName());
        }

        BigDecimal totalMaterialCost = BigDecimal.ZERO;
        BigDecimal totalEquipmentLoss = BigDecimal.ZERO;
        BigDecimal totalEnergyCost = BigDecimal.ZERO;
        BigDecimal totalLaborCost = BigDecimal.ZERO;
        BigDecimal totalDefectiveLoss = BigDecimal.ZERO;
        BigDecimal totalQuantity = BigDecimal.ZERO;

        for (WorkOrder order : orders) {
            if (order.getMaterialUsage() != null) {
                totalMaterialCost = totalMaterialCost.add(order.getMaterialUsage());
            }
            if (order.getEquipmentLoss() != null) {
                totalEquipmentLoss = totalEquipmentLoss.add(order.getEquipmentLoss());
            }
            if (order.getEnergyCost() != null) {
                totalEnergyCost = totalEnergyCost.add(order.getEnergyCost());
            }
            if (order.getLaborHours() != null) {
                totalLaborCost = totalLaborCost.add(order.getLaborHours());
            }
            if (order.getDefectiveLoss() != null) {
                totalDefectiveLoss = totalDefectiveLoss.add(order.getDefectiveLoss());
            }
            if (order.getQuantity() != null) {
                totalQuantity = totalQuantity.add(order.getQuantity());
            }
        }

        summary.setTotalMaterialCost(totalMaterialCost);
        summary.setTotalEquipmentLoss(totalEquipmentLoss);
        summary.setTotalEnergyCost(totalEnergyCost);
        summary.setTotalLaborCost(totalLaborCost);
        summary.setTotalDefectiveLoss(totalDefectiveLoss);
        summary.setTotalCost(totalMaterialCost
                .add(totalEquipmentLoss)
                .add(totalEnergyCost)
                .add(totalLaborCost)
                .add(totalDefectiveLoss));
        summary.setTotalQuantity(totalQuantity);
        summary.setWorkOrderCount(orders.size());

        return summary;
    }

    private LocalDateTime getQuarterStartDate(Integer year, Integer quarter) {
        int startMonth = (quarter - 1) * 3 + 1;
        return LocalDateTime.of(year, startMonth, 1, 0, 0, 0);
    }

    private LocalDateTime getQuarterEndDate(Integer year, Integer quarter) {
        int endMonth = quarter * 3;
        int lastDay = LocalDateTime.of(year, endMonth, 1, 0, 0, 0)
                .toLocalDate().lengthOfMonth();
        return LocalDateTime.of(year, endMonth, lastDay, 23, 59, 59);
    }

    private void validateQuarter(Integer quarter) {
        if (quarter < 1 || quarter > 4) {
            throw new BusinessException("季度必须在1-4之间");
        }
    }

    private void clearCostSummaryCache() {
        redisUtil.deleteByPrefix("bearing:costsummary:");
        redisUtil.deleteByPrefix("costSummaryCache:");
    }
}
