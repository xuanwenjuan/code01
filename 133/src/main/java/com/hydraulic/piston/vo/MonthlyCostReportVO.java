package com.hydraulic.piston.vo;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class MonthlyCostReportVO {
    private Integer reportYear;
    private Integer reportMonth;

    private Integer totalOrders;
    private Integer totalQuantity;

    private BigDecimal totalMaterialCost;
    private BigDecimal totalToolCost;
    private BigDecimal totalEnergyCost;
    private BigDecimal totalLaborCost;
    private BigDecimal totalScrapCost;
    private BigDecimal totalCost;

    private BigDecimal avgUnitCost;

    private BigDecimal avgMaterialCostPerUnit;
    private BigDecimal avgToolCostPerUnit;
    private BigDecimal avgEnergyCostPerUnit;
    private BigDecimal avgLaborCostPerUnit;
}
