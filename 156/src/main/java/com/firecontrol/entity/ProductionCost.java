package com.firecontrol.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("production_cost")
public class ProductionCost extends BaseEntity {

    private String costNo;

    private Long workOrderId;

    private String orderNo;

    private Long productId;

    private String productName;

    private BigDecimal productionQuantity;

    private String categoryName;

    private BigDecimal qualifiedQuantity;

    private BigDecimal scrapQuantity;

    private BigDecimal materialCost;

    private BigDecimal equipmentCost;

    private BigDecimal energyCost;

    private BigDecimal laborCost;

    private BigDecimal qualityCost;

    private BigDecimal scrapCost;

    private BigDecimal totalCost;

    private BigDecimal unitCost;

    private BigDecimal materialCostRatio;

    private BigDecimal laborCostRatio;

    private BigDecimal scrapRate;

    private LocalDate costDate;

    private String costPeriod;

    private String remark;
}
