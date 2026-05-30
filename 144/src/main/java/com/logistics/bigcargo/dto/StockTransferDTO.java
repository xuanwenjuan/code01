package com.logistics.bigcargo.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StockTransferDTO {
    @NotNull(message = "库存ID不能为空")
    private Long inventoryId;

    @NotBlank(message = "目标库区不能为空")
    private String targetZone;

    private String transferReason;

    private Integer transferQuantity;
}
