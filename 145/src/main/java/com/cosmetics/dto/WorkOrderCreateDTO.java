package com.cosmetics.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class WorkOrderCreateDTO {

    @NotNull(message = "产品ID不能为空")
    private Long productId;

    @NotNull(message = "配方ID不能为空")
    private Long formulaId;

    @NotNull(message = "计划产量不能为空")
    @DecimalMin(value = "1", message = "计划产量必须大于0")
    private BigDecimal planQuantity;

    private String unit;

    private Integer priority;

    private Long qcId;

    @NotNull(message = "计划开始日期不能为空")
    private LocalDate planStartDate;

    @NotNull(message = "计划结束日期不能为空")
    private LocalDate planEndDate;

    private String remark;

    private List<WorkOrderMaterialDTO> materials;
}
