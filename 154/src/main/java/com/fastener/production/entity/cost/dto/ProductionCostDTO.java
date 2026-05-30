package com.fastener.production.entity.cost.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ProductionCostDTO {

    private Long id;

    @NotNull(message = "费用类型不能为空")
    private Integer costType;

    private Long workOrderId;

    private Long categoryId;

    @NotNull(message = "费用金额不能为空")
    private BigDecimal amount;

    private BigDecimal quantity;

    private BigDecimal unitPrice;

    private LocalDate costDate;

    private String operator;

    private String remark;
}
