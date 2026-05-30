package com.firecontrol.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProcessOperationDTO {

    @NotNull(message = "工单ID不能为空")
    private Long workOrderId;

    @NotBlank(message = "工序编码不能为空")
    private String processCode;

    private String operationContent;

    private String inspectionResult;

    private BigDecimal qualifiedQuantity;

    private BigDecimal scrapQuantity;

    private String remark;
}
