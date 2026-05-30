package com.naturaldye.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class WorkOrderMaterialDTO {

    @NotNull(message = "库存ID不能为空")
    private Long inventoryId;

    private String materialName;

    @NotNull(message = "用料数量不能为空")
    private BigDecimal quantity;

    private BigDecimal unitPrice;

    private BigDecimal lossRate;

    private String remarks;
}
