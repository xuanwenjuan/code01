package com.valve.manufacture.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductionLossDTO {

    @NotNull(message = "工单ID不能为空")
    private Long workOrderId;

    private Long processId;

    @NotBlank(message = "损耗类型不能为空")
    private String lossType;

    private Long materialId;

    @PositiveOrZero(message = "损耗数量不能为负数")
    private BigDecimal lossQuantity;

    private BigDecimal unitPrice;

    private Integer scrapCount;

    private BigDecimal scrapCost;

    private BigDecimal toolWearCost;

    private BigDecimal energyCost;

    private String remark;
}
