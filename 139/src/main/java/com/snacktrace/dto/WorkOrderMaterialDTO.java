package com.snacktrace.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class WorkOrderMaterialDTO {
    @NotNull(message = "原料ID不能为空")
    private Long materialId;

    private String materialName;
    private BigDecimal planQuantity;
    private BigDecimal unitPrice;
}
