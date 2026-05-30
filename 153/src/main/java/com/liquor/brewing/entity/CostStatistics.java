package com.liquor.brewing.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.liquor.brewing.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("cost_statistics")
public class CostStatistics extends BaseEntity {

    private String statisticsMonth;

    private Integer workOrderCount;

    private BigDecimal materialCost;

    private BigDecimal equipmentCost;

    private BigDecimal utilityCost;

    private BigDecimal laborCost;

    private BigDecimal scrapCost;

    private BigDecimal totalCost;

    private BigDecimal totalOutput;

    private BigDecimal unitCost;
}
