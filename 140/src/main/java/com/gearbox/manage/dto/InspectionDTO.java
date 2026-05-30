package com.gearbox.manage.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class InspectionDTO {
    private Long workOrderId;

    private Long processId;

    @NotNull(message = "检验数量不能为空")
    private Integer inspectQuantity;

    private Integer qualifiedQuantity;

    private Integer scrapQuantity;

    private Integer reworkQuantity;

    private String scrapReason;

    private String inspectionItems;

    private String status;

    private String remark;
}
