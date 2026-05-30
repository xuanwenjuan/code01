package com.logistics.bigcargo.vo;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class CostStatisticsVO {
    private String costMonth;

    private Long categoryId;

    private String categoryName;

    private Integer orderCount;

    private BigDecimal avgCost;

    private BigDecimal storageFee;

    private BigDecimal sortingFee;

    private BigDecimal transportFee;

    private BigDecimal loadingFee;

    private BigDecimal damageFee;

    private BigDecimal totalCost;

    private BigDecimal costPerOrder;
}
