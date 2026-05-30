package com.aluminum.extrusion.vo;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class MonthlyReportVO {
    private String categoryName;
    private Integer orderCount;
    private BigDecimal totalMaterialCost;
    private BigDecimal totalMoldCost;
    private BigDecimal totalEnergyCost;
    private BigDecimal totalLaborCost;
    private BigDecimal totalScrapCost;
    private BigDecimal totalCost;
    private BigDecimal totalOutputValue;
    private BigDecimal totalProfit;
    private BigDecimal profitMargin;
}
