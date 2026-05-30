package com.paper.production.dto.quality;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class DefectiveProductDTO {

    private Long id;

    @NotNull(message = "工单ID不能为空")
    private Long workOrderId;

    @NotNull(message = "工序ID不能为空")
    private Long processId;

    @NotBlank(message = "工序类型不能为空")
    private String processType;

    @NotBlank(message = "工序名称不能为空")
    private String processName;

    @NotNull(message = "次品数量不能为空")
    private BigDecimal defectiveQuantity;

    @NotNull(message = "总数量不能为空")
    private BigDecimal totalQuantity;

    @NotBlank(message = "次品类型不能为空")
    private String defectiveType;

    @NotBlank(message = "次品原因不能为空")
    private String defectiveReason;

    @NotBlank(message = "处理方式不能为空")
    private String handleMethod;

    private BigDecimal handleCost;
    private BigDecimal scrapValue;
    private String inspector;
    private String operator;
    private String remark;
}
