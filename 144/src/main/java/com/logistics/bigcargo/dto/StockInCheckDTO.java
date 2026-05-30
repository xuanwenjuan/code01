package com.logistics.bigcargo.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class StockInCheckDTO {
    @NotNull(message = "库存ID不能为空")
    private Long inventoryId;

    private Integer actualQuantity;

    private BigDecimal actualWeight;

    private BigDecimal actualVolume;

    private String checkRemark;

    private Boolean passFlag = true;
}
