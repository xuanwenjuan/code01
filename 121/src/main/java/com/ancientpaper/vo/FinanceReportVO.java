package com.ancientpaper.vo;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class FinanceReportVO {
    private Long categoryId;
    private String categoryName;
    private BigDecimal totalMaterialCost;
    private BigDecimal totalLaborCost;
    private BigDecimal totalWorkHourCost;
    private BigDecimal totalSalesRevenue;
    private BigDecimal totalProfit;
    private BigDecimal totalProductionQuantity;
    private BigDecimal totalSalesQuantity;
}