package com.aquascape.service;

import com.aquascape.entity.FinanceRecord;
import com.aquascape.exception.BusinessException;
import com.aquascape.mapper.FinanceRecordMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import cn.hutool.core.util.IdUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class FinanceService {

    @Autowired
    private FinanceRecordMapper financeRecordMapper;

    public Page<FinanceRecord> page(int page, int size, Integer recordType, LocalDate startDate, LocalDate endDate) {
        LambdaQueryWrapper<FinanceRecord> wrapper = new LambdaQueryWrapper<>();
        if (recordType != null) {
            wrapper.eq(FinanceRecord::getRecordType, recordType);
        }
        if (startDate != null) {
            wrapper.ge(FinanceRecord::getRecordDate, startDate);
        }
        if (endDate != null) {
            wrapper.le(FinanceRecord::getRecordDate, endDate);
        }
        wrapper.orderByDesc(FinanceRecord::getRecordDate);
        return financeRecordMapper.selectPage(new Page<>(page, size), wrapper);
    }

    public List<FinanceRecord> list() {
        return financeRecordMapper.selectList(null);
    }

    @Transactional(rollbackFor = Exception.class)
    public void addRecord(FinanceRecordDTO dto) {
        if (dto.getRecordType() == null) {
            throw new BusinessException("记录类型不能为空");
        }
        if (dto.getAmount() == null || dto.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("金额必须大于0");
        }

        FinanceRecord record = new FinanceRecord();
        org.springframework.beans.BeanUtils.copyProperties(dto, record);
        record.setRecordNo("FIN-" + IdUtil.getSnowflakeNextIdStr());
        if (record.getRecordDate() == null) {
            record.setRecordDate(LocalDate.now());
        }
        financeRecordMapper.insert(record);
    }

    @Transactional(rollbackFor = Exception.class)
    public void addRecord(FinanceRecord record) {
        if (record.getRecordType() == null) {
            throw new BusinessException("记录类型不能为空");
        }
        if (record.getAmount() == null || record.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("金额必须大于0");
        }

        record.setRecordNo("FIN-" + IdUtil.getSnowflakeNextIdStr());
        if (record.getRecordDate() == null) {
            record.setRecordDate(LocalDate.now());
        }
        financeRecordMapper.insert(record);
    }

    @Transactional(rollbackFor = Exception.class)
    public void update(Long id, FinanceRecord record) {
        FinanceRecord existing = financeRecordMapper.selectById(id);
        if (existing == null) {
            throw new BusinessException("财务记录不存在");
        }
        record.setId(id);
        financeRecordMapper.updateById(record);
    }

    public void delete(Long id) {
        financeRecordMapper.deleteById(id);
    }

    public Map<String, Object> getReport(LocalDate startDate, LocalDate endDate) {
        if (startDate == null) {
            startDate = LocalDate.now().withDayOfMonth(1);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }

        List<FinanceRecord> records = financeRecordMapper.selectList(
                new LambdaQueryWrapper<FinanceRecord>()
                        .between(FinanceRecord::getRecordDate, startDate, endDate)
        );

        BigDecimal totalPurchase = BigDecimal.ZERO;
        BigDecimal totalIncome = BigDecimal.ZERO;
        BigDecimal totalLoss = BigDecimal.ZERO;

        Map<String, BigDecimal> categoryPurchase = new HashMap<>();

        for (FinanceRecord record : records) {
            if (record.getRecordType() == 1) {
                totalPurchase = totalPurchase.add(record.getAmount());
                String categoryName = record.getCategoryName() != null ? record.getCategoryName() : "未分类";
                categoryPurchase.merge(categoryName, record.getAmount(), BigDecimal::add);
            } else if (record.getRecordType() == 2) {
                totalIncome = totalIncome.add(record.getAmount());
            } else if (record.getRecordType() == 3) {
                totalLoss = totalLoss.add(record.getAmount());
            }
        }

        BigDecimal profit = totalIncome.subtract(totalPurchase).subtract(totalLoss);
        BigDecimal profitRate = totalIncome.compareTo(BigDecimal.ZERO) > 0
                ? profit.divide(totalIncome, 4, BigDecimal.ROUND_HALF_UP).multiply(BigDecimal.valueOf(100))
                : BigDecimal.ZERO;

        Map<String, Object> result = new HashMap<>();
        result.put("startDate", startDate);
        result.put("endDate", endDate);
        result.put("totalPurchase", totalPurchase);
        result.put("totalIncome", totalIncome);
        result.put("totalLoss", totalLoss);
        result.put("profit", profit);
        result.put("profitRate", profitRate);
        result.put("categoryPurchase", categoryPurchase);
        result.put("recordCount", records.size());

        return result;
    }

    public Map<String, Object> getDashboardData() {
        LocalDate today = LocalDate.now();
        LocalDate firstDayOfMonth = today.withDayOfMonth(1);

        Map<String, Object> monthlyReport = getReport(firstDayOfMonth, today);

        LambdaQueryWrapper<FinanceRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.ge(FinanceRecord::getRecordDate, firstDayOfMonth)
                .le(FinanceRecord::getRecordDate, today);
        List<FinanceRecord> records = financeRecordMapper.selectList(wrapper);

        Map<String, BigDecimal> dailyTrend = new HashMap<>();
        for (FinanceRecord record : records) {
            String dateStr = record.getRecordDate().toString();
            if (record.getRecordType() == 2) {
                dailyTrend.merge(dateStr, record.getAmount(), BigDecimal::add);
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("monthlyReport", monthlyReport);
        result.put("dailyTrend", dailyTrend);

        return result;
    }
}
