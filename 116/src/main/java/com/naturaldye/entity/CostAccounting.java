package com.naturaldye.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("cost_accounting")
public class CostAccounting extends BaseEntity {

    private Long categoryId;

    private String categoryName;

    private LocalDate statisticsDate;

    private Integer orderCount;

    private BigDecimal fabricConsumption;

    private BigDecimal fabricCost;

    private BigDecimal dyeConsumption;

    private BigDecimal dyeCost;

    private BigDecimal laborHours;

    private BigDecimal laborCost;

    private BigDecimal otherCost;

    private BigDecimal totalCost;

    private BigDecimal totalRevenue;

    private BigDecimal profit;

    private String remarks;
}
