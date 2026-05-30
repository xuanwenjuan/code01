package com.evparts.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class WorkOrderMaterialDTO {

    private Long id;

    @NotNull(message = "原料ID不能为空")
    private Long materialId;

    @NotNull(message = "计划用量不能为空")
    private BigDecimal planQuantity;

    private BigDecimal unitPrice;

    private String remark;

}
