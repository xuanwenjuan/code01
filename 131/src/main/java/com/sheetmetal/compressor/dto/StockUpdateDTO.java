package com.sheetmetal.compressor.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class StockUpdateDTO {
    @NotNull(message = "原料ID不能为空")
    private Long id;

    @NotNull(message = "变更数量不能为空")
    private BigDecimal quantity;
}
