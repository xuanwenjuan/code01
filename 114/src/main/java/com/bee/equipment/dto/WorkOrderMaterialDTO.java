package com.bee.equipment.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class WorkOrderMaterialDTO {

    private Long id;

    private Long workOrderId;

    @NotNull(message = "物料ID不能为空")
    private Long materialId;

    @NotNull(message = "所需数量不能为空")
    private BigDecimal requiredQuantity;

    private BigDecimal actualQuantity;
}
