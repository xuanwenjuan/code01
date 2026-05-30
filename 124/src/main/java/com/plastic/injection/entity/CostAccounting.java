package com.plastic.injection.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("cost_accounting")
public class CostAccounting extends BaseEntity {

    private Long orderId;

    private String orderNo;

    private Long productId;

    private String productName;

    private Long categoryId;

    private String categoryName;

    private BigDecimal productionQuantity;

    private BigDecimal materialCost;

    private BigDecimal machineCost;

    private BigDecimal laborCost;

    private BigDecimal defectiveCost;

    private BigDecimal totalCost;

    private BigDecimal unitCost;

    private BigDecimal salesPrice;

    private BigDecimal grossProfit;

    private BigDecimal grossProfitMargin;

    private LocalDate accountingDate;

    private String remark;
}
