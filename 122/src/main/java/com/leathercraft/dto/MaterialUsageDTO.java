package com.leathercraft.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class MaterialUsageDTO {
    @NotNull(message = "物料ID不能为空")
    private Long materialId;
    @NotNull(message = "用量不能为空")
    @Positive(message = "用量必须大于0")
    private BigDecimal quantity;
    private BigDecimal lossQuantity;
    private String remark;
}
