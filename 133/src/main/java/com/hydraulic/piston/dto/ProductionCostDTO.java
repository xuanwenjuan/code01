package com.hydraulic.piston.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductionCostDTO {
    private Long id;

    @NotNull(message = "工单ID不能为空")
    private Long orderId;

    private BigDecimal materialCost;

    private BigDecimal toolCost;

    private BigDecimal energyCost;

    private BigDecimal laborCost;

    private BigDecimal scrapCost;

    private String remark;
}
