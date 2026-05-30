package com.spring.manufacturing.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProcessCompleteDTO {

    @NotNull(message = "工单ID不能为空")
    private Long workOrderId;

    @NotNull(message = "工序编码不能为空")
    private String processCode;

    @NotNull(message = "合格数量不能为空")
    @PositiveOrZero(message = "合格数量不能为负数")
    private Integer qualifiedQuantity;

    @PositiveOrZero(message = "次品数量不能为负数")
    private Integer defectiveQuantity = 0;

    private BigDecimal materialWaste;

    private BigDecimal energyConsumption;

    private BigDecimal laborHours;

    private String processParams;

    private String remark;
}