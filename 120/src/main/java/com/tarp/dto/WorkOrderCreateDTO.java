package com.tarp.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class WorkOrderCreateDTO {
    @NotNull(message = "篷布分类ID不能为空")
    private Long categoryId;

    @NotNull(message = "生产数量不能为空")
    @Positive(message = "生产数量必须大于0")
    private Integer quantity;

    private BigDecimal laborCost;

    private LocalDateTime expectTime;

    private String remark;

    @NotEmpty(message = "用料明细不能为空")
    @Valid
    private List<WorkOrderMaterialDTO> materials;
}
