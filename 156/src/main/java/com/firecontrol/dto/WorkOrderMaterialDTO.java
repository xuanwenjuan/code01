package com.firecontrol.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class WorkOrderMaterialDTO {

    private Long id;

    @NotNull(message = "物资ID不能为空")
    private Long materialId;

    @NotNull(message = "需求数量不能为空")
    private BigDecimal requiredQuantity;

    private String remark;
}
