package com.cosmetics.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class WorkOrderMaterialDTO {

    @NotNull(message = "原料ID不能为空")
    private Long materialId;

    private Long materialBatchId;

    @NotNull(message = "计划用量不能为空")
    @DecimalMin(value = "0.01", message = "计划用量必须大于0")
    private BigDecimal planQuantity;

    private String unit;

    private String remark;
}
