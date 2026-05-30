package com.paper.production.dto.cost;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ProductionCostDTO {

    private Long id;

    @NotNull(message = "工单ID不能为空")
    private Long workOrderId;

    private String orderNo;
    private String orderName;
    private BigDecimal materialCost;
    private BigDecimal equipmentCost;
    private BigDecimal utilityCost;
    private BigDecimal laborCost;
    private BigDecimal scrapCost;
    private BigDecimal totalCost;
    private BigDecimal outputQuantity;
    private BigDecimal unitCost;
    private LocalDate costDate;
    private String period;
    private Integer status;
    private String remark;
}
