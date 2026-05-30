package com.snacktrace.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class QcInspectionDTO {
    @NotNull(message = "工单ID不能为空")
    private Long workOrderId;

    @NotNull(message = "巡检阶段不能为空")
    private Integer inspectionStage;

    @NotNull(message = "检查数量不能为空")
    private BigDecimal checkQuantity;

    @NotNull(message = "合格数量不能为空")
    private BigDecimal qualifiedQuantity;

    private BigDecimal defectQuantity;
    private String defectReason;
    private String remark;
}
