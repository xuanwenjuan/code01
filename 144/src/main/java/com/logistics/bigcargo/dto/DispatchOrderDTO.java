package com.logistics.bigcargo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class DispatchOrderDTO {
    private Long id;

    private Long inventoryId;

    private Long categoryId;

    private String customerName;

    private String customerPhone;

    private String pickupAddress;

    @NotBlank(message = "配送地址不能为空")
    private String deliveryAddress;

    private BigDecimal distance;

    private Long vehicleId;

    private Long driverId;

    private Long sorterId;

    private Integer orderStatus;

    private Integer priority = 0;

    private LocalDateTime expectArriveTime;

    private String remark;
}
