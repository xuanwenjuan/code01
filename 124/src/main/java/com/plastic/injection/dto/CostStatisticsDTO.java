package com.plastic.injection.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class CostStatisticsDTO {

    private Integer totalOrders;

    private BigDecimal totalMaterialCost;

    private BigDecimal totalMachineCost;

    private BigDecimal totalLaborCost;

    private BigDecimal totalDefectiveCost;

    private BigDecimal totalCost;

    private BigDecimal totalProductionQuantity;

    private BigDecimal avgUnitCost;
}
