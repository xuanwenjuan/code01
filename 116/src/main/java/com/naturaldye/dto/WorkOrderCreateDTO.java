package com.naturaldye.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class WorkOrderCreateDTO {

    @NotNull(message = "色系类目ID不能为空")
    private Long categoryId;

    @NotBlank(message = "面料名称不能为空")
    private String fabricName;

    private String fabricSpec;

    @NotNull(message = "面料数量不能为空")
    private BigDecimal fabricQuantity;

    private Long assignedUserId;

    private String remarks;

    @NotEmpty(message = "工单用料不能为空")
    @Valid
    private List<WorkOrderMaterialDTO> materials;
}
