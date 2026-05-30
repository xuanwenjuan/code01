package com.ancientpaper.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class OrderMaterialDTO {
    @NotNull(message = "原料ID不能为空")
    private Long materialId;

    @NotNull(message = "使用数量不能为空")
    private BigDecimal quantity;
}