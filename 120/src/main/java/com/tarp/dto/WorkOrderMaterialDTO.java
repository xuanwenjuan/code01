package com.tarp.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class WorkOrderMaterialDTO {
    @NotNull(message = "材料ID不能为空")
    private Long materialId;

    private String materialName;

    @NotNull(message = "使用数量不能为空")
    @Positive(message = "使用数量必须大于0")
    private BigDecimal usageQuantity;

    private BigDecimal unitPrice;

    private BigDecimal totalPrice;
}
