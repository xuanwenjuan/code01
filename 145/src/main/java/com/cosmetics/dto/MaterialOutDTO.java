package com.cosmetics.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class MaterialOutDTO {

    @NotNull(message = "原料批次ID不能为空")
    private Long materialBatchId;

    @NotNull(message = "出库数量不能为空")
    @DecimalMin(value = "0.01", message = "出库数量必须大于0")
    private BigDecimal quantity;

    private Long workOrderId;

    private String remark;
}
