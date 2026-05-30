package com.incense.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.incense.entity.QuarterlyReport;
import com.incense.mapper.QuarterlyReportMapper;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class QuarterlyReportService extends ServiceImpl<QuarterlyReportMapper, QuarterlyReport> {

    public Page<QuarterlyReport> getPage(int pageNum, int pageSize, Integer year, Integer quarter) {
        LambdaQueryWrapper<QuarterlyReport> wrapper = new LambdaQueryWrapper<>();
        if (year != null) {
            wrapper.eq(QuarterlyReport::getReportYear, year);
        }
        if (quarter != null) {
            wrapper.eq(QuarterlyReport::getReportQuarter, quarter);
        }
        wrapper.orderByDesc(QuarterlyReport::getReportYear)
                .orderByDesc(QuarterlyReport::getReportQuarter);
        return page(new Page<>(pageNum, pageSize), wrapper);
    }

    public void generateQuarterlyReport(Integer year, Integer quarter) {
        LambdaQueryWrapper<QuarterlyReport> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(QuarterlyReport::getReportYear, year)
                .eq(QuarterlyReport::getReportQuarter, quarter);
        remove(wrapper);

        QuarterlyReport report = new QuarterlyReport();
        report.setReportYear(year);
        report.setReportQuarter(quarter);
        report.setTotalUsage(BigDecimal.ZERO);
        report.setProcessCost(BigDecimal.ZERO);
        report.setLossCost(BigDecimal.ZERO);
        report.setSalesRevenue(BigDecimal.ZERO);
        report.setTotalCost(BigDecimal.ZERO);
        report.setProfit(BigDecimal.ZERO);
        report.setCreateTime(LocalDateTime.now());
        save(report);
    }

    public List<QuarterlyReport> getAll() {
        return list(new LambdaQueryWrapper<QuarterlyReport>()
                .orderByDesc(QuarterlyReport::getReportYear)
                .orderByDesc(QuarterlyReport::getReportQuarter));
    }
}
