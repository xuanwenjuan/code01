package com.fitness.manufacture.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.fitness.manufacture.common.PageQuery;
import com.fitness.manufacture.entity.MonthlyProductionReport;

public interface MonthlyProductionReportService extends IService<MonthlyProductionReport> {

    void generateMonthlyReport(String reportMonth);

    void confirmMonthlyReport(Long id);

    IPage<MonthlyProductionReport> getReportPage(PageQuery query, String reportMonth, Integer status);

    void generateLastMonthReport();
}
