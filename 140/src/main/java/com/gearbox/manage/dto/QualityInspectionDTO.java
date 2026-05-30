package com.gearbox.manage.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class QualityInspectionDTO {
    @NotNull(message = "工单ID不能为空")
    private Long workOrderId;

    private Long processId;

    @NotBlank(message = "检验类型不能为空")
    private String inspectionType;

    @NotNull(message = "检验数量不能为空")
    private Integer inspectionQuantity;

    private Integer qualifiedQuantity;

    private Integer unqualifiedQuantity;

    private Integer scrapQuantity;

    private Integer reworkQuantity;

    @NotBlank(message = "检验结果不能为空")
    private String result;

    private String remark;

    private String defectDescription;
}
