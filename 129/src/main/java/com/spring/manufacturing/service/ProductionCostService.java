package com.spring.manufacturing.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.spring.manufacturing.entity.ProductionCost;

import java.math.BigDecimal;
import java.util.List;

public interface ProductionCostService extends IService<ProductionCost> {

    void generateMonthlyReport(String month);

    IPage<ProductionCost> getCostReportPage(int page, int size, String month, Long categoryId);

    List<ProductionCost> getCostSummaryByCategory(String month);

    void updateCostItem(Long id, String costType, BigDecimal amount);
}