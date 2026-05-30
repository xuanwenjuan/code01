package com.textile.production.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class OrderMaterialDTO {

    private Long id;

    @NotNull(message = "原料ID不能为空")
    private Long materialId;

    private Long batchId;

    @NotNull(message = "计划用量不能为空")
    private BigDecimal planQuantity;

    private String unit;

    private BigDecimal unitPrice;
}
