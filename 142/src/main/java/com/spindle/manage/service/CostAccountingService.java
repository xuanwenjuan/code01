package com.spindle.manage.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.spindle.manage.dto.CostAccountingDTO;
import com.spindle.manage.dto.CostSummaryDTO;
import com.spindle.manage.dto.ProductionLossQueryDTO;
import com.spindle.manage.entity.ProductionLossRecord;

import java.math.BigDecimal;
import java.util.List;

public interface CostAccountingService {

    CostAccountingDTO calculateOrderCost(Long orderId);

    CostSummaryDTO getPeriodCostSummary(String startDate, String endDate);

    IPage<ProductionLossRecord> getLossRecords(Page<ProductionLossRecord> page, ProductionLossQueryDTO dto);

    List<ProductionLossRecord> getOrderLossRecords(Long orderId);

    BigDecimal calculateTotalLossAmount(Long orderId);

    CostSummaryDTO getCategoryCostSummary(Long categoryId, String startDate, String endDate);

}
