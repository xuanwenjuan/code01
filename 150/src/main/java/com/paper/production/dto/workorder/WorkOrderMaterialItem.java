package com.paper.production.dto.workorder;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class WorkOrderMaterialItem {

    @NotNull(message = "物料ID不能为空")
    private Long materialId;

    @NotBlank(message = "批次号不能为空")
    private String batchNo;

    @NotNull(message = "数量不能为空")
    private BigDecimal quantity;
}
