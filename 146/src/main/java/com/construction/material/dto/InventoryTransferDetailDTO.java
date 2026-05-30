package com.construction.material.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class InventoryTransferDetailDTO {

    @NotNull(message = "库存ID不能为空")
    private Long inventoryId;

    @NotNull(message = "调拨数量不能为空")
    private BigDecimal quantity;
}
