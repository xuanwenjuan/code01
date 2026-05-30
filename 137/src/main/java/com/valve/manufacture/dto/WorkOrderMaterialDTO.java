package com.valve.manufacture.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class WorkOrderMaterialDTO {

    @NotNull(message = "原料ID不能为空")
    private Long materialId;

    private Long batchId;

    @NotNull(message = "数量不能为空")
    @Positive(message = "数量必须大于0")
    private BigDecimal quantity;

    private BigDecimal unitPrice;

    private String remark;
}
