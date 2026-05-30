package com.paper.production.dto.workorder;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class WorkOrderMaterialDTO {

    @NotNull(message = "物料ID不能为空")
    private Long materialId;

    private String materialCode;
    private String materialName;
    private String specification;
    private String unit;

    @NotNull(message = "计划用量不能为空")
    private BigDecimal planQuantity;

    private BigDecimal unitPrice;
    private String remark;
}
