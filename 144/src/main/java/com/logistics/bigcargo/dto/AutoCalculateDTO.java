package com.logistics.bigcargo.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AutoCalculateDTO {
    @NotNull(message = "工单ID不能为空")
    private Long orderId;

    private Integer storageDays;

    private BigDecimal storageUnitPrice;

    private BigDecimal sortingUnitPrice;

    private BigDecimal transportUnitPrice;

    private BigDecimal loadingUnitPrice;
}
