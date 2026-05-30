package com.textile.production.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;

@Data
public class CostDetailDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    @NotNull(message = "工单ID不能为空")
    private Long orderId;

    private BigDecimal equipmentCost;
    private BigDecimal laborCost;
    private BigDecimal dyeCost;
    private BigDecimal processLossCost;
    private BigDecimal shrinkageLossCost;
    private BigDecimal defectiveCost;
    private BigDecimal energyCost;
    private BigDecimal managementCost;
    private BigDecimal otherCost;

    private String remark;
}
