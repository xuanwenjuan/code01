package com.motor.core.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProcessCompleteDTO {
    @NotNull(message = "工单ID不能为空")
    private Long orderId;

    @NotNull(message = "工序编码不能为空")
    private String processCode;

    @NotNull(message = "产出数量不能为空")
    @PositiveOrZero(message = "产出数量不能为负数")
    private Integer outputQuantity;

    @PositiveOrZero(message = "不良品数量不能为负数")
    private Integer defectiveQuantity = 0;

    private BigDecimal materialWaste;

    private BigDecimal energyConsumption;

    private BigDecimal laborHours;

    private String remark;
}
