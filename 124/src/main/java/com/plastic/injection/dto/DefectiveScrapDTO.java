package com.plastic.injection.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class DefectiveScrapDTO {

    @NotNull(message = "工单ID不能为空")
    private Long orderId;

    @NotNull(message = "原料ID不能为空")
    private Long materialId;

    @NotNull(message = "报废数量不能为空")
    @DecimalMin(value = "0.01", message = "报废数量必须大于0")
    private BigDecimal scrapQuantity;

    @NotBlank(message = "报废原因不能为空")
    private String scrapReason;

    private String remark;
}
