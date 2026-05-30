package com.bee.equipment.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CostStatisticsDTO {

    private Long id;

    private LocalDate statisticsDate;

    private Long equipmentCategoryId;

    private BigDecimal materialCost;

    private BigDecimal laborCost;

    private BigDecimal transportCost;

    private BigDecimal totalCost;

    private BigDecimal salesRevenue;

    private BigDecimal profit;

    private Integer productionQuantity;
}
