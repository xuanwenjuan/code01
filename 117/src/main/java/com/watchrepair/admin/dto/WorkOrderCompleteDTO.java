package com.watchrepair.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class WorkOrderCompleteDTO {

    @NotNull(message = "工单ID不能为空")
    private Long workOrderId;

    private BigDecimal actualLaborCost;

    private BigDecimal actualAppearanceCost;

    private BigDecimal lossCost;

    @NotBlank(message = "检测报告不能为空")
    private String inspectionReport;

    private String remarks;
}