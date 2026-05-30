package com.heritage.dye.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductionOrderDTO {
    private Long id;

    @NotNull(message = "染料类目不能为空")
    private Long dyeCategoryId;

    @NotNull(message = "原料产地不能为空")
    private Long materialOriginId;

    @NotNull(message = "原料数量不能为空")
    @DecimalMin(value = "0.01", message = "原料数量必须大于0")
    @DecimalMax(value = "999999.99", message = "原料数量不能超过999999.99")
    private BigDecimal materialQuantity;

    @NotNull(message = "预期产出率不能为空")
    @DecimalMin(value = "0.01", message = "预期产出率必须大于0")
    @DecimalMax(value = "100", message = "预期产出率不能超过100")
    private BigDecimal expectedOutputRate;

    @NotNull(message = "库房管理员不能为空")
    private Long warehouseManagerId;

    @NotNull(message = "炼料师不能为空")
    private Long masterId;

    @Size(max = 500, message = "备注长度不能超过500")
    private String remark;
}
