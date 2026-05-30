package com.evparts.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class MaterialStockOutDTO {

    @NotNull(message = "工单ID不能为空")
    private Long workOrderId;

    @NotNull(message = "原料ID不能为空")
    private Long materialId;

    @NotNull(message = "库存ID不能为空")
    private Long stockId;

    @NotNull(message = "出库数量不能为空")
    private BigDecimal quantity;

    private String remark;

}
