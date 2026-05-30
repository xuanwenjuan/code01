package com.gearbox.manage.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class WorkOrderMaterialDTO {
    @NotNull(message = "物料ID不能为空")
    private Long materialId;

    private String materialName;

    @NotNull(message = "需求数量不能为空")
    @Positive(message = "需求数量必须大于0")
    private BigDecimal requiredQuantity;

    private String unit;
}
