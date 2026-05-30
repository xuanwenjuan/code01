package com.amber.polish.vo;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProfitStatisticsVO {

    private Long categoryId;

    private String categoryName;

    private BigDecimal totalRawStoneCost;

    private BigDecimal totalMaterialCost;

    private BigDecimal totalLaborCost;

    private BigDecimal totalCost;

    private BigDecimal totalIncome;

    private BigDecimal totalProfit;

    private BigDecimal avgProfitRate;

    private Long orderCount;
}
