package com.tarp.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("cost_statistics")
public class CostStatistics extends BaseEntity {
    private Long categoryId;
    private String categoryName;
    private LocalDate statisticsDate;
    private Integer totalOrders;
    private Integer totalQuantity;
    private BigDecimal materialCost;
    private BigDecimal oilProcessCost;
    private BigDecimal laborCost;
    private BigDecimal totalCost;
    private BigDecimal salesRevenue;
    private BigDecimal profit;
}
