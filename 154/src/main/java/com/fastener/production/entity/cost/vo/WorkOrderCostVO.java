package com.fastener.production.entity.cost.vo;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class WorkOrderCostVO {

    private Long workOrderId;

    private String orderNo;

    private String categoryName;

    private String specification;

    private Integer planQuantity;

    private Integer actualQuantity;

    private Integer scrapQuantity;

    private BigDecimal scrapRate;

    private BigDecimal materialCost;

    private BigDecimal moldCost;

    private BigDecimal electricityCost;

    private BigDecimal laborCost;

    private BigDecimal scrapCost;

    private BigDecimal totalCost;

    private BigDecimal unitCost;

    private BigDecimal totalWorkingHours;

    private BigDecimal efficiency;
}
