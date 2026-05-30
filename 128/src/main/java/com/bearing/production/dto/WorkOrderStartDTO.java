package com.bearing.production.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class WorkOrderStartDTO {

    @NotNull(message = "工单ID不能为空")
    private Long workOrderId;

    @NotNull(message = "原料ID不能为空")
    private Long materialId;

    @NotNull(message = "领用数量不能为空")
    @DecimalMin(value = "0.01", message = "领用数量必须大于0")
    private BigDecimal materialQuantity;

    private String processEngineer;

    private String lineLeader;

    private String remark;
}
