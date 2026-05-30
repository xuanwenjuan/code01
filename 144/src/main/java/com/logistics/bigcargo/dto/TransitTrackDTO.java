package com.logistics.bigcargo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class TransitTrackDTO {
    @NotNull(message = "工单ID不能为空")
    private Long orderId;

    @NotBlank(message = "当前位置不能为空")
    private String currentLocation;

    private BigDecimal currentLatitude;

    private BigDecimal currentLongitude;

    private String trackRemark;
}
