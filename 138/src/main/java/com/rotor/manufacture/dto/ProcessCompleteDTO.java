package com.rotor.manufacture.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProcessCompleteDTO {
    @NotNull(message = "工序ID不能为空")
    private Long processId;

    @NotNull(message = "合格数量不能为空")
    @PositiveOrZero(message = "合格数量必须大于等于0")
    private Integer qualifiedQuantity;

    @PositiveOrZero(message = "不良数量必须大于等于0")
    private Integer defectiveQuantity = 0;

    private BigDecimal energyConsumption;
    private BigDecimal laborHours;
    private String remark;
}