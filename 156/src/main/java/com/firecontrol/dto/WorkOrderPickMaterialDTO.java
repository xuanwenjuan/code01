package com.firecontrol.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class WorkOrderPickMaterialDTO {

    @NotNull(message = "工单ID不能为空")
    private Long workOrderId;

    @NotNull(message = "物资ID不能为空")
    private Long materialId;

    @NotNull(message = "批次ID不能为空")
    private Long batchId;

    @NotNull(message = "领料数量不能为空")
    private BigDecimal quantity;

    private String remark;
}
