package com.bee.equipment.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class MaterialLossDTO {

    @NotNull(message = "物料ID不能为空")
    private Long materialId;

    @NotNull(message = "标准用量不能为空")
    private BigDecimal standardQuantity;

    @NotNull(message = "实际用量不能为空")
    private BigDecimal actualQuantity;

    private String lossReason;
}
