package com.flange.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class MaterialUsageDto {
    @NotNull(message = "工单ID不能为空")
    private Long orderId;

    @NotNull(message = "物料ID不能为空")
    private Long materialId;

    @NotNull(message = "领用数量不能为空")
    private BigDecimal usageQuantity;

    @NotNull(message = "单价不能为空")
    private BigDecimal unitPrice;
}
