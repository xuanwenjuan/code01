package com.cosmetics.service;

import com.cosmetics.entity.CostStatistics;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface CostStatisticsService {

    CostStatistics getByWorkOrderId(Long workOrderId);

    List<CostStatistics> getByDateRange(LocalDate startDate, LocalDate endDate);

    void updateCost(Long id, CostStatistics cost);

    Map<String, Object> getCostSummary(LocalDate startDate, LocalDate endDate);

    Map<String, Object> getCostTrend(LocalDate startDate, LocalDate endDate);

    Map<String, Object> getCostByProduct(LocalDate startDate, LocalDate endDate);

    Map<String, Object> getCostDetail(Long workOrderId);

    void recalculateCost(Long workOrderId);

    CostStatistics getById(Long id);
}
