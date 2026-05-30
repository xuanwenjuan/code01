package com.firecontrol.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.firecontrol.common.PageQuery;
import com.firecontrol.entity.ProductionCost;
import com.firecontrol.vo.CostAnalysisVO;
import com.firecontrol.vo.CostStatisticsVO;

import java.time.LocalDate;
import java.util.List;

public interface ProductionCostService {

    void calculateWorkOrderCost(Long workOrderId);

    ProductionCost getCostById(Long id);

    IPage<ProductionCost> getCostPage(ProductionCost cost, PageQuery pageQuery);

    CostStatisticsVO getCostStatistics(LocalDate startDate, LocalDate endDate);

    List<ProductionCost> getCostByDateRange(LocalDate startDate, LocalDate endDate);

    List<ProductionCost> getCostByWorkOrderId(Long workOrderId);

    void generateMonthlyReport();

    byte[] exportWorkOrderMaterialDetail(Long workOrderId);

    CostAnalysisVO getCostAnalysis(LocalDate startDate, LocalDate endDate);

    void autoCalculateCosts();
}
