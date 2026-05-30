package com.motor.core.dto;

import com.motor.core.validation.annotation.PriorityValid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ProductionOrderCreateDTO {
    @NotNull(message = "产品类目ID不能为空")
    private Long categoryId;

    @NotBlank(message = "产品名称不能为空")
    private String productName;

    @NotNull(message = "计划数量不能为空")
    @Positive(message = "计划数量必须大于0")
    private Integer planQuantity;

    @NotNull(message = "物料ID不能为空")
    private Long materialId;

    @NotNull(message = "物料用量不能为空")
    @Positive(message = "物料用量必须大于0")
    private BigDecimal materialUsage;

    @PriorityValid
    private Integer priority = 1;

    private LocalDate planStartDate;

    private LocalDate planEndDate;

    private Long processLeaderId;

    private String remark;
}
