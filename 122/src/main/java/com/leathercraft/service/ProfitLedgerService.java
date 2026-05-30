package com.leathercraft.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.leathercraft.entity.ProfitLedger;
import com.leathercraft.mapper.ProfitLedgerMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProfitLedgerService {

    private final ProfitLedgerMapper profitLedgerMapper;
    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    private static final String STATISTICS_CACHE_KEY = "ledger:statistics:";

    private String generateLedgerNo() {
        String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randomStr = String.format("%04d", new Random().nextInt(10000));
        return "PL-" + dateStr + "-" + randomStr;
    }

    @Transactional(rollbackFor = Exception.class)
    public void create(ProfitLedger ledger) {
        ledger.setLedgerNo(generateLedgerNo());
        if (ledger.getTotalCost() == null) {
            BigDecimal totalCost = BigDecimal.ZERO;
            if (ledger.getLeatherCost() != null) {
                totalCost = totalCost.add(ledger.getLeatherCost());
            }
            if (ledger.getMaterialCost() != null) {
                totalCost = totalCost.add(ledger.getMaterialCost());
            }
            if (ledger.getLaborCost() != null) {
                totalCost = totalCost.add(ledger.getLaborCost());
            }
            ledger.setTotalCost(totalCost);
        }
        if (ledger.getProfit() == null && ledger.getSellingPrice() != null) {
            ledger.setProfit(ledger.getSellingPrice().subtract(ledger.getTotalCost()));
        }
        if (ledger.getProfitRate() == null && ledger.getTotalCost().compareTo(BigDecimal.ZERO) > 0) {
            ledger.setProfitRate(ledger.getProfit().divide(ledger.getTotalCost(), 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100")));
        }
        profitLedgerMapper.insert(ledger);
        clearStatisticsCache();
    }

    @Transactional(rollbackFor = Exception.class)
    public void update(ProfitLedger ledger) {
        BigDecimal totalCost = BigDecimal.ZERO;
        if (ledger.getLeatherCost() != null) {
            totalCost = totalCost.add(ledger.getLeatherCost());
        }
        if (ledger.getMaterialCost() != null) {
            totalCost = totalCost.add(ledger.getMaterialCost());
        }
        if (ledger.getLaborCost() != null) {
            totalCost = totalCost.add(ledger.getLaborCost());
        }
        ledger.setTotalCost(totalCost);

        if (ledger.getSellingPrice() != null) {
            ledger.setProfit(ledger.getSellingPrice().subtract(totalCost));
        }

        if (totalCost.compareTo(BigDecimal.ZERO) > 0 && ledger.getProfit() != null) {
            ledger.setProfitRate(ledger.getProfit().divide(totalCost, 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100")));
        }

        profitLedgerMapper.updateById(ledger);
        clearStatisticsCache();
    }

    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        profitLedgerMapper.deleteById(id);
        clearStatisticsCache();
    }

    public List<ProfitLedger> list(LocalDate startDate, LocalDate endDate, Long categoryId) {
        LambdaQueryWrapper<ProfitLedger> wrapper = new LambdaQueryWrapper<>();
        if (startDate != null) {
            wrapper.ge(ProfitLedger::getStatDate, startDate);
        }
        if (endDate != null) {
            wrapper.le(ProfitLedger::getStatDate, endDate);
        }
        if (categoryId != null) {
            wrapper.eq(ProfitLedger::getProductCategoryId, categoryId);
        }
        wrapper.orderByDesc(ProfitLedger::getStatDate);
        return profitLedgerMapper.selectList(wrapper);
    }

    public Map<String, Object> getStatistics(LocalDate startDate, LocalDate endDate) {
        String cacheKey = STATISTICS_CACHE_KEY + startDate + ":" + endDate;
        try {
            String cacheData = redisTemplate.opsForValue().get(cacheKey);
            if (cacheData != null) {
                return objectMapper.readValue(cacheData, Map.class);
            }
        } catch (Exception e) {
        }

        List<ProfitLedger> list = list(startDate, endDate, null);

        BigDecimal totalLeatherCost = list.stream()
                .map(l -> l.getLeatherCost() != null ? l.getLeatherCost() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalMaterialCost = list.stream()
                .map(l -> l.getMaterialCost() != null ? l.getMaterialCost() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalLaborCost = list.stream()
                .map(l -> l.getLaborCost() != null ? l.getLaborCost() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalCost = list.stream()
                .map(l -> l.getTotalCost() != null ? l.getTotalCost() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalSellingPrice = list.stream()
                .map(l -> l.getSellingPrice() != null ? l.getSellingPrice() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalProfit = list.stream()
                .map(l -> l.getProfit() != null ? l.getProfit() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, BigDecimal> categoryProfit = list.stream()
                .collect(Collectors.groupingBy(
                        l -> l.getProductCategoryName() != null ? l.getProductCategoryName() : "未分类",
                        Collectors.reducing(
                                BigDecimal.ZERO,
                                l -> l.getProfit() != null ? l.getProfit() : BigDecimal.ZERO,
                                BigDecimal::add
                        )
                ));

        Map<String, Object> result = new HashMap<>();
        result.put("totalLeatherCost", totalLeatherCost);
        result.put("totalMaterialCost", totalMaterialCost);
        result.put("totalLaborCost", totalLaborCost);
        result.put("totalCost", totalCost);
        result.put("totalSellingPrice", totalSellingPrice);
        result.put("totalProfit", totalProfit);
        result.put("categoryProfit", categoryProfit);
        result.put("orderCount", list.size());

        BigDecimal profitRate = totalCost.compareTo(BigDecimal.ZERO) > 0
                ? totalProfit.divide(totalCost, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100"))
                : BigDecimal.ZERO;
        result.put("profitRate", profitRate);

        try {
            redisTemplate.opsForValue().set(cacheKey, objectMapper.writeValueAsString(result), 30, TimeUnit.MINUTES);
        } catch (Exception e) {
        }

        return result;
    }

    public Map<String, Object> getMonthlyTrend(int months) {
        Map<String, BigDecimal> monthlyProfit = new HashMap<>();
        Map<String, BigDecimal> monthlyCost = new HashMap<>();
        LocalDate now = LocalDate.now();

        for (int i = months - 1; i >= 0; i--) {
            YearMonth yearMonth = YearMonth.from(now.minusMonths(i));
            LocalDate start = yearMonth.atDay(1);
            LocalDate end = yearMonth.atEndOfMonth();

            Map<String, Object> stat = getStatistics(start, end);
            String monthKey = yearMonth.getYear() + "-" + String.format("%02d", yearMonth.getMonthValue());
            monthlyProfit.put(monthKey, (BigDecimal) stat.get("totalProfit"));
            monthlyCost.put(monthKey, (BigDecimal) stat.get("totalCost"));
        }

        return Map.of(
                "monthlyProfit", monthlyProfit,
                "monthlyCost", monthlyCost
        );
    }

    public ProfitLedger getById(Long id) {
        return profitLedgerMapper.selectById(id);
    }

    private void clearStatisticsCache() {
        redisTemplate.delete(redisTemplate.keys(STATISTICS_CACHE_KEY + "*"));
    }
}
