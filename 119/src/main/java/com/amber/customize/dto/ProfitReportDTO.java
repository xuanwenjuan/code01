package com.amber.customize.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProfitReportDTO {

    private Long categoryId;

    private String categoryName;

    private Long orderCount;

    private BigDecimal totalRawCost;

    private BigDecimal totalMaterialCost;

    private BigDecimal totalLaborCost;

    private BigDecimal totalCost;

    private BigDecimal totalRevenue;

    private BigDecimal totalProfit;

    private BigDecimal avgProfitRate;

}