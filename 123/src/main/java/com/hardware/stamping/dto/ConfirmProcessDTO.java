package com.hardware.stamping.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ConfirmProcessDTO {
    @NotNull(message = "工单ID不能为空")
    private Long orderId;

    private String moldNo;

    private String machineNo;

    private String technician;

    @NotNull(message = "原料ID不能为空")
    private Long materialId;

    @NotNull(message = "锁定数量不能为空")
    private BigDecimal lockQuantity;

    private String remark;
}
