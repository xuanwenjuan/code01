package com.spring.manufacturing.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class MaterialRequirementDTO {

    @NotNull(message = "原料ID不能为空")
    private Long materialId;

    @NotNull(message = "需求数量不能为空")
    @Positive(message = "需求数量必须大于0")
    private BigDecimal requiredQuantity;
}