package com.naturaldye.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class MaterialLossDTO {

    @NotBlank(message = "物料名称不能为空")
    private String materialName;

    @NotNull(message = "计划用量不能为空")
    private BigDecimal plannedQuantity;

    @NotNull(message = "实际用量不能为空")
    private BigDecimal actualQuantity;

    private String lossReason;
}
