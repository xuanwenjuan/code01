package com.fan.impeller.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductionCostDTO {
    private BigDecimal materialCostRate;
    private BigDecimal moldCostRate;
    private BigDecimal energyCostRate;
    private BigDecimal laborCostRate;
    private BigDecimal scrapCostRate;
}
