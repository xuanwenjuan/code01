package com.motor.core.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ProductionOrderDTO {
    @NotNull(message = "产品类目ID不能为空")
    private Long categoryId;

    @NotBlank(message = "产品名称不能为空")
    private String productName;

    @NotNull(message = "计划数量不能为空")
    @Positive(message = "计划数量必须大于0")
    private Integer planQuantity;

    private Long materialId;

    private Integer priority;

    private LocalDate planStartDate;

    private LocalDate planEndDate;

    private String remark;
}
