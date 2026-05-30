package com.firecontrol.vo;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class CostStatisticsVO {

    private BigDecimal totalMaterialCost;
    private BigDecimal totalEquipmentCost;
    private BigDecimal totalEnergyCost;
    private BigDecimal totalLaborCost;
    private BigDecimal totalScrapCost;
    private BigDecimal totalCost;
    private BigDecimal totalProductionQuantity;
    private BigDecimal averageUnitCost;
    private Long workOrderCount;

    private String materialCostRatio;
    private String equipmentCostRatio;
    private String energyCostRatio;
    private String laborCostRatio;
    private String scrapCostRatio;
}
