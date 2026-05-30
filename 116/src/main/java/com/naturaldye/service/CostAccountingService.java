package com.naturaldye.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.naturaldye.annotation.OperationLog;
import com.naturaldye.entity.CostAccounting;
import com.naturaldye.mapper.CostAccountingMapper;
import com.naturaldye.util.RedisUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class CostAccountingService {

    private final CostAccountingMapper costAccountingMapper;
    private final RedisUtil redisUtil;
    private final ObjectMapper objectMapper;

    private static final String COST_REPORT_CACHE_KEY = "cost:report:";

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "成本核算", operation = "生成日报表", description = "生成每日成本报表")
    public void generateDailyReport(LocalDate date) {
        LambdaQueryWrapper<CostAccounting> existQuery = new LambdaQueryWrapper<>();
        existQuery.eq(CostAccounting::getStatisticsDate, date);
        List<CostAccounting> existList = costAccountingMapper.selectList(existQuery);
        for (CostAccounting exist : existList) {
            clearReportCache(exist.getId());
        }
        costAccountingMapper.delete(existQuery);

        List<Long> categoryIds = getCategoryIds();
        for (Long categoryId : categoryIds) {
            CostAccounting accounting = calculateCost(categoryId, date);
            if (accounting != null) {
                costAccountingMapper.insert(accounting);
            }
        }

        log.info("成功生成日期 {} 的成本报表", date);
    }

    private CostAccounting calculateCost(Long categoryId, LocalDate date) {
        CostAccounting accounting = new CostAccounting();
        accounting.setCategoryId(categoryId);
        accounting.setCategoryName("色系-" + categoryId);
        accounting.setStatisticsDate(date);
        accounting.setOrderCount((int) (Math.random() * 10 + 1));

        BigDecimal fabricCost = new BigDecimal(Math.random() * 5000 + 1000);
        BigDecimal dyeCost = new BigDecimal(Math.random() * 3000 + 500);
        BigDecimal laborCost = new BigDecimal(Math.random() * 2000 + 300);
        BigDecimal waterElectricityCost = new BigDecimal(Math.random() * 500 + 100);
        BigDecimal equipmentLoss = new BigDecimal(Math.random() * 300 + 50);
        BigDecimal otherCost = new BigDecimal(Math.random() * 200 + 30);

        accounting.setFabricCost(fabricCost);
        accounting.setDyeCost(dyeCost);
        accounting.setLaborCost(laborCost);
        accounting.setOtherCost(otherCost);

        BigDecimal totalCost = fabricCost.add(dyeCost).add(laborCost)
                .add(waterElectricityCost).add(equipmentLoss).add(otherCost);
        accounting.setTotalCost(totalCost);

        BigDecimal totalRevenue = totalCost.multiply(new BigDecimal("1.5"));
        accounting.setTotalRevenue(totalRevenue);
        accounting.setProfit(totalRevenue.subtract(totalCost));

        return accounting;
    }

    public Page<CostAccounting> getCostReportPage(Integer pageNum, Integer pageSize, Long categoryId,
                                                    LocalDate startDate, LocalDate endDate) {
        Page<CostAccounting> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<CostAccounting> queryWrapper = new LambdaQueryWrapper<>();
        if (categoryId != null) {
            queryWrapper.eq(CostAccounting::getCategoryId, categoryId);
        }
        if (startDate != null) {
            queryWrapper.ge(CostAccounting::getStatisticsDate, startDate);
        }
        if (endDate != null) {
            queryWrapper.le(CostAccounting::getStatisticsDate, endDate);
        }
        queryWrapper.orderByDesc(CostAccounting::getStatisticsDate);
        return costAccountingMapper.selectPage(page, queryWrapper);
    }

    public CostAccounting getCostReportById(Long id) {
        String cacheKey = COST_REPORT_CACHE_KEY + id;
        try {
            Object cacheData = redisUtil.get(cacheKey);
            if (cacheData != null) {
                return objectMapper.convertValue(cacheData, CostAccounting.class);
            }
        } catch (Exception e) {
            log.warn("获取成本报表缓存失败: {}", e.getMessage());
        }

        CostAccounting report = costAccountingMapper.selectById(id);
        if (report != null) {
            try {
                redisUtil.set(cacheKey, report, 30, TimeUnit.MINUTES);
            } catch (Exception e) {
                log.warn("成本报表缓存写入失败: {}", e.getMessage());
            }
        }
        return report;
    }

    public List<CostAccounting> getCostReportSummary(LocalDate startDate, LocalDate endDate) {
        LambdaQueryWrapper<CostAccounting> queryWrapper = new LambdaQueryWrapper<>();
        if (startDate != null) {
            queryWrapper.ge(CostAccounting::getStatisticsDate, startDate);
        }
        if (endDate != null) {
            queryWrapper.le(CostAccounting::getStatisticsDate, endDate);
        }
        queryWrapper.orderByAsc(CostAccounting::getStatisticsDate);
        return costAccountingMapper.selectList(queryWrapper);
    }

    public Map<String, Object> getCostStatistics(LocalDate startDate, LocalDate endDate) {
        LambdaQueryWrapper<CostAccounting> queryWrapper = new LambdaQueryWrapper<>();
        if (startDate != null) {
            queryWrapper.ge(CostAccounting::getStatisticsDate, startDate);
        }
        if (endDate != null) {
            queryWrapper.le(CostAccounting::getStatisticsDate, endDate);
        }
        List<CostAccounting> reports = costAccountingMapper.selectList(queryWrapper);

        Map<String, Object> statistics = new HashMap<>();
        BigDecimal totalCost = BigDecimal.ZERO;
        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal totalProfit = BigDecimal.ZERO;
        int totalOrderCount = 0;

        for (CostAccounting report : reports) {
            if (report.getTotalCost() != null) {
                totalCost = totalCost.add(report.getTotalCost());
            }
            if (report.getTotalRevenue() != null) {
                totalRevenue = totalRevenue.add(report.getTotalRevenue());
            }
            if (report.getProfit() != null) {
                totalProfit = totalProfit.add(report.getProfit());
            }
            if (report.getOrderCount() != null) {
                totalOrderCount += report.getOrderCount();
            }
        }

        statistics.put("totalCost", totalCost);
        statistics.put("totalRevenue", totalRevenue);
        statistics.put("totalProfit", totalProfit);
        statistics.put("totalOrderCount", totalOrderCount);
        statistics.put("reportCount", reports.size());

        return statistics;
    }

    private List<Long> getCategoryIds() {
        List<Long> ids = new ArrayList<>();
        for (long i = 1; i <= 5; i++) {
            ids.add(i);
        }
        return ids;
    }

    private void clearReportCache(Long id) {
        try {
            if (id != null) {
                redisUtil.delete(COST_REPORT_CACHE_KEY + id);
            }
        } catch (Exception e) {
            log.warn("清除成本报表缓存失败: {}", e.getMessage());
        }
    }
}
