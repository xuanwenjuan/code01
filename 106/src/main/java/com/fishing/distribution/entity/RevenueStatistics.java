package com.fishing.distribution.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("revenue_statistics")
public class RevenueStatistics extends BaseEntity {

    private LocalDate statisticsDate;

    private String statisticsType;

    private String fleetName;

    private Long categoryId;

    private String categoryName;

    private BigDecimal totalCatchWeight;

    private BigDecimal sortingLossWeight;

    private BigDecimal coldChainCost;

    private BigDecimal salesAmount;

    private BigDecimal netProfit;
}
