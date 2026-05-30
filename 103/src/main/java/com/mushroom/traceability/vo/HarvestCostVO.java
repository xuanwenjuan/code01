package com.mushroom.traceability.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.util.Map;

@Data
public class HarvestCostVO {
    private Long taskId;
    private String taskName;
    private BigDecimal totalHarvestQuantity;
    private BigDecimal totalQualifiedQuantity;
    private BigDecimal totalDefectiveQuantity;
    private BigDecimal totalDamageQuantity;
    private BigDecimal totalLossQuantity;
    private BigDecimal lossRate;
    private Map<String, BigDecimal> categoryCostMap;
    private BigDecimal comprehensiveCost;
    private BigDecimal unitCost;
}