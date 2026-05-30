package com.snacktrace.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class MaterialUseDTO {
    @NotNull(message = "工单ID不能为空")
    private Long workOrderId;

    @NotNull(message = "原料ID不能为空")
    private Long materialId;

    @NotNull(message = "批次ID不能为空")
    private Long batchId;

    @NotNull(message = "领用数量不能为空")
    private BigDecimal quantity;

    private BigDecimal unitPrice;
    private String remark;
}
