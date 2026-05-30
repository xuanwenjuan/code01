package com.bee.equipment.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class CostStatisticsVO {

    private Long id;

    private LocalDate statisticsDate;

    private Long equipmentCategoryId;

    private String equipmentCategoryName;

    private BigDecimal materialCost;

    private BigDecimal laborCost;

    private BigDecimal transportCost;

    private BigDecimal lossCost;

    private BigDecimal totalCost;

    private BigDecimal salesRevenue;

    private BigDecimal profit;

    private BigDecimal profitRate;

    private Integer productionQuantity;

    private BigDecimal unitCost;

    private LocalDateTime createTime;
}
