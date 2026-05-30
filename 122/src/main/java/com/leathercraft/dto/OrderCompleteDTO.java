package com.leathercraft.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class OrderCompleteDTO {
    @NotNull(message = "工单ID不能为空")
    private Long orderId;
    private Boolean passed;
    private BigDecimal actualQuantity;
    private BigDecimal lossQuantity;
    private BigDecimal leatherCost;
    private BigDecimal materialCost;
    private BigDecimal laborCost;
    private BigDecimal lossCost;
    private String remark;
}
