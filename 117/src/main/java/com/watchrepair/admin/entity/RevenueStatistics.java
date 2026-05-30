package com.watchrepair.admin.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("revenue_statistics")
public class RevenueStatistics extends BaseEntity {

    private Long categoryId;

    private String categoryName;

    private LocalDate statisticsDate;

    private Integer orderCount;

    private BigDecimal partsCostTotal;

    private BigDecimal laborCostTotal;

    private BigDecimal appearanceCostTotal;

    private BigDecimal consignmentProfit;

    private BigDecimal totalRevenue;

    @TableField(exist = false)
    private String statisticsMonth;
}