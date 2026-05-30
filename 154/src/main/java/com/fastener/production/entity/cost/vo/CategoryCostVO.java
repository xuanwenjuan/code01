package com.fastener.production.entity.cost.vo;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class CategoryCostVO {

    private Long categoryId;

    private String categoryName;

    private String specification;

    private Integer totalQuantity;

    private Integer totalScrap;

    private BigDecimal scrapRate;

    private BigDecimal totalMaterialCost;

    private BigDecimal totalMoldCost;

    private BigDecimal totalElectricityCost;

    private BigDecimal totalLaborCost;

    private BigDecimal totalScrapCost;

    private BigDecimal totalCost;

    private BigDecimal unitCost;
}
