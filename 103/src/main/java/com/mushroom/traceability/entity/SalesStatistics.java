package com.mushroom.traceability.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sales_statistics")
public class SalesStatistics extends BaseEntity {
    private LocalDate statisticsDate;

    private Long categoryId;

    private String categoryName;

    private Long areaId;

    private String areaName;

    private BigDecimal harvestTotal;

    private BigDecimal lossTotal;

    private BigDecimal logisticsCost;

    private BigDecimal salesRevenue;

    private BigDecimal netProfit;
}