package com.construction.material.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class WorkOrderVerifyDetailDTO {

    @NotNull(message = "明细ID不能为空")
    private Long detailId;

    private BigDecimal usedQuantity;

    private BigDecimal returnedQuantity;

    private BigDecimal lostQuantity;
}
