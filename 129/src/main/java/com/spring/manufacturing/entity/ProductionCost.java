package com.spring.manufacturing.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("production_cost")
public class ProductionCost extends BaseEntity {

    private String costMonth;

    private Long categoryId;

    private String categoryName;

    private Integer totalOutput;

    private BigDecimal materialCost;

    private BigDecimal energyCost;

    private BigDecimal moldCost;

    private BigDecimal laborCost;

    private BigDecimal defectiveCost;

    private BigDecimal totalCost;

    private BigDecimal unitCost;
}