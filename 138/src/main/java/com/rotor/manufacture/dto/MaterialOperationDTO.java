package com.rotor.manufacture.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class MaterialOperationDTO {
    @NotNull(message = "工单ID不能为空")
    private Long orderId;

    @NotNull(message = "原料ID不能为空")
    private Long materialId;

    @NotNull(message = "数量不能为空")
    private BigDecimal quantity;

    private String remark;
}