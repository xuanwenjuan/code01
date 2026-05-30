package com.incense.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class MaterialUsageDTO {

    @NotNull(message = "原料ID不能为空")
    private Long materialId;

    private String materialName;

    private String batchCode;

    @NotNull(message = "使用数量不能为空")
    private BigDecimal usageQuantity;

    private String unit;

    private BigDecimal unitPrice;

    private BigDecimal totalPrice;
}
