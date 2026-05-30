package com.gearbox.manage.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CostAccountingDTO {
    @NotNull(message = "工单ID不能为空")
    private Long workOrderId;

    private BigDecimal materialCost;
    private BigDecimal toolCost;
    private BigDecimal machineCost;
    private BigDecimal laborCost;
    private BigDecimal scrapCost;
    private Integer qualifiedQuantity;
    private Integer scrapQuantity;
    private String remark;
}
