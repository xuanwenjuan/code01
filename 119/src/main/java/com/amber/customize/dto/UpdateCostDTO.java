package com.amber.customize.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class UpdateCostDTO {

    private BigDecimal materialCost;

    private BigDecimal laborCost;

    private BigDecimal carvingHours;

    private BigDecimal polishingCost;

    private BigDecimal otherCost;

    private BigDecimal totalPrice;

}
