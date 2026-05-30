package com.incense.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductionOrderDTO {
    private Long id;

    @NotNull(message = "品类ID不能为空")
    private Long categoryId;

    private String categoryName;

    private String formulaDetail;

    @NotNull(message = "目标产量不能为空")
    private BigDecimal targetQuantity;

    private String unit = "kg";

    private String remark;
}
