package com.logistics.bigcargo.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class VehicleMatchDTO {
    @NotNull(message = "工单ID不能为空")
    private Long orderId;

    private BigDecimal totalWeight;

    private BigDecimal totalVolume;

    private String deliveryArea;
}
