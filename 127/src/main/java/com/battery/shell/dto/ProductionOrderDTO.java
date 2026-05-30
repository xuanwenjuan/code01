package com.battery.shell.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ProductionOrderDTO {
    private Long id;

    @NotNull(message = "分类ID不能为空")
    private Long categoryId;

    private String shellSpec;

    @NotNull(message = "计划数量不能为空")
    @Positive(message = "计划数量必须大于0")
    private Integer planQuantity;

    @NotNull(message = "物料ID不能为空")
    private Long materialId;

    private BigDecimal materialUsage;

    private LocalDateTime planStartTime;

    private LocalDateTime planEndTime;

    private Long operatorId;

    private String remark;
}
