package com.leathercraft.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProcessingOrderDTO {
    @NotNull(message = "物料ID不能为空")
    private Long materialId;

    private Long productCategoryId;

    @NotNull(message = "加工数量不能为空")
    @Positive(message = "加工数量必须大于0")
    private BigDecimal quantity;

    private String unit;

    private String remark;
}
