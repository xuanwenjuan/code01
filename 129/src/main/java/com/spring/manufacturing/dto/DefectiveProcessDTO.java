package com.spring.manufacturing.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class DefectiveProcessDTO {

    @NotNull(message = "工单ID不能为空")
    private Long workOrderId;

    @NotBlank(message = "工序编码不能为空")
    private String processCode;

    @NotNull(message = "处理数量不能为空")
    @Positive(message = "处理数量必须大于0")
    private Integer processQuantity;

    @NotBlank(message = "处理类型不能为空")
    private String processType;

    private BigDecimal scrapCost;

    private BigDecimal reworkCost;

    private String remark;
}