package com.zongshi.brush.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class OrderCompleteDTO {
    @NotNull(message = "工单ID不能为空")
    private Long orderId;

    @NotNull(message = "实际生产数量不能为空")
    @Min(value = 1, message = "实际生产数量最小为1")
    private Integer actualQuantity;

    private Integer defectiveQuantity = 0;

    private BigDecimal laborCost = BigDecimal.ZERO;

    private BigDecimal processLossCost = BigDecimal.ZERO;

    private BigDecimal defectiveCost = BigDecimal.ZERO;

    private String remark;
}
