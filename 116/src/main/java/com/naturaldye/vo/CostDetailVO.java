package com.naturaldye.vo;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class CostDetailVO {

    private BigDecimal fabricCost;

    private BigDecimal dyeCost;

    private BigDecimal laborCost;

    private BigDecimal waterElectricityCost;

    private BigDecimal equipmentLoss;

    private BigDecimal otherCost;

    private BigDecimal totalMaterialCost;

    private BigDecimal totalCost;

    private BigDecimal unitCost;

    private BigDecimal lossAmount;

    private BigDecimal lossRate;
}
