package com.logistics.bigcargo.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class LogisticsCostDTO {
    private Long id;

    @NotNull(message = "工单ID不能为空")
    private Long orderId;

    private Long categoryId;

    private BigDecimal storageFee = BigDecimal.ZERO;

    private BigDecimal sortingFee = BigDecimal.ZERO;

    private BigDecimal transportFee = BigDecimal.ZERO;

    private BigDecimal loadingFee = BigDecimal.ZERO;

    private BigDecimal damageFee = BigDecimal.ZERO;

    private String costMonth;

    private String remark;
}
