package com.evparts.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class MaterialStockTransferDTO {

    @NotNull(message = "源库存ID不能为空")
    private Long fromStockId;

    @NotNull(message = "目标仓库不能为空")
    private String toWarehouse;

    @NotNull(message = "调拨数量不能为空")
    private BigDecimal quantity;

    private String remark;

}
