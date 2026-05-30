package com.flange.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class QualityInspectionDto {
    private Long id;

    @NotNull(message = "工单ID不能为空")
    private Long orderId;

    @NotNull(message = "抽检数量不能为空")
    @Min(value = 1, message = "抽检数量必须大于0")
    @Max(value = 10000, message = "抽检数量不能超过10000")
    private Integer inspectedQuantity;

    @NotNull(message = "合格数量不能为空")
    @Min(value = 0, message = "合格数量不能为负数")
    private Integer passedQuantity;

    private Integer defectQuantity;

    @Size(max = 500, message = "不良描述长度不能超过500")
    private String defectDescription;

    @Size(max = 500, message = "备注长度不能超过500")
    private String remark;
}
