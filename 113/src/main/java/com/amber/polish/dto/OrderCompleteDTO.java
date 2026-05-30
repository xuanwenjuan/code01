package com.amber.polish.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class OrderCompleteDTO {

    @NotNull(message = "工单ID不能为空")
    private Long orderId;

    @PositiveOrZero(message = "原石损耗率不能为负数")
    private BigDecimal stoneLossRate;

    @PositiveOrZero(message = "耗材损耗不能为负数")
    private BigDecimal materialLoss;

    @PositiveOrZero(message = "人工工时不能为负数")
    private BigDecimal laborHours;

    @PositiveOrZero(message = "设备损耗不能为负数")
    private BigDecimal equipmentCost;

    private String remark;
}
