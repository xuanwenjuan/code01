package com.mushroom.traceability.dto;

import com.mushroom.traceability.annotation.NotZero;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class HarvestItemDTO {
    @NotNull(message = "品类ID不能为空")
    private Long categoryId;
    private String categoryName;
    @NotZero(message = "合格数量必须大于0")
    private BigDecimal qualifiedQuantity;
    private BigDecimal defectiveQuantity;
    private BigDecimal damageQuantity;
    private String qualityLevel;
}