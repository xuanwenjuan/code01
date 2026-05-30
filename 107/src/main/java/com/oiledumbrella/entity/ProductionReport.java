package com.oiledumbrella.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("production_report")
public class ProductionReport extends BaseEntity {
    private LocalDate reportDate;
    private Long styleId;
    private Integer orderCount;
    private Integer totalQuantity;
    private BigDecimal totalSales;
    private BigDecimal materialCost;
    private BigDecimal laborCost;
    private BigDecimal totalCost;
    private BigDecimal profit;
    private BigDecimal profitMargin;

    @TableField(exist = false)
    private String styleName;
}
