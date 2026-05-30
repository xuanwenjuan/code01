package com.fan.impeller.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class QualityInspectionDTO {
    @NotNull(message = "工单ID不能为空")
    private Long workOrderId;

    @NotNull(message = "工序不能为空")
    private Integer step;

    private String stepName;

    @NotNull(message = "总数量不能为空")
    private BigDecimal totalQuantity;

    @NotNull(message = "合格数量不能为空")
    private BigDecimal qualifiedQuantity;

    private BigDecimal unqualifiedQuantity;

    private String unqualifiedReason;

    private BigDecimal scrapQuantity;

    private BigDecimal reworkQuantity;

    @NotNull(message = "检验结果不能为空")
    private Integer result;

    private String remark;
}
