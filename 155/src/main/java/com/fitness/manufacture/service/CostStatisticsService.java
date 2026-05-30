package com.fitness.manufacture.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.fitness.manufacture.common.PageQuery;
import com.fitness.manufacture.dto.CostStatisticsQueryDTO;
import com.fitness.manufacture.entity.CostStatistics;

import java.time.LocalDate;
import java.util.List;

public interface CostStatisticsService extends IService<CostStatistics> {

    void calculateWorkOrderCost(Long workOrderId);

    IPage<CostStatistics> getCostStatisticsPage(PageQuery query, LocalDate startDate, LocalDate endDate, Long productId);

    IPage<CostStatistics> getCostStatisticsPageByConditions(CostStatisticsQueryDTO queryDTO);

    List<CostStatistics> getCostStatisticsList(LocalDate startDate, LocalDate endDate, Long productId);
}
