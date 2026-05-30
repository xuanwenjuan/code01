package com.spindle.manage.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class CostSummaryDTO {

    private String startDate;

    private String endDate;

    private Integer totalOrderCount;

    private BigDecimal totalMaterialCost;

    private BigDecimal totalLossCost;

    private BigDecimal totalProcessingCost;

    private BigDecimal totalCost;

}
