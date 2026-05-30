package com.gearbox.manage.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PickMaterialDTO {
    @NotNull(message = "工单物料ID不能为空")
    private Long workOrderMaterialId;

    @NotNull(message = "批次ID不能为空")
    private Long batchId;

    @NotNull(message = "领料数量不能为空")
    @Positive(message = "领料数量必须大于0")
    private BigDecimal quantity;

    private String remark;
}
