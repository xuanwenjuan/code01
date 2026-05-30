package com.cosmetics.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class CostUpdateDTO {

    private BigDecimal packagingCost;

    private BigDecimal energyCost;

    private BigDecimal laborCost;

    private BigDecimal scrapCost;

    private String remark;
}
