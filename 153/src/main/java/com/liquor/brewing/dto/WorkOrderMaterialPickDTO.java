package com.liquor.brewing.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class WorkOrderMaterialPickDTO {

    @NotNull(message = "工单ID不能为空")
    private Long workOrderId;

    @NotNull(message = "物料ID不能为空")
    private Long materialId;

    @NotNull(message = "批次ID不能为空")
    private Long batchId;

    @NotNull(message = "领料数量不能为空")
    @DecimalMin(value = "0.01", message = "领料数量必须大于0")
    private BigDecimal quantity;

    private String remark;
}
