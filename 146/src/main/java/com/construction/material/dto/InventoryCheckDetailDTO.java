package com.construction.material.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class InventoryCheckDetailDTO {

    @NotNull(message = "库存ID不能为空")
    private Long inventoryId;

    @NotNull(message = "盘点数量不能为空")
    private BigDecimal checkQuantity;

    private String remark;
}
