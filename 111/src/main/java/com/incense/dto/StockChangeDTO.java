package com.incense.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class StockChangeDTO {

    @NotNull(message = "原料ID不能为空")
    private Long materialId;

    @NotNull(message = "数量不能为空")
    private BigDecimal quantity;

    private String remark;
}
