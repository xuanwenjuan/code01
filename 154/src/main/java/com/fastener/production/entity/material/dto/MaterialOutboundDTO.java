package com.fastener.production.entity.material.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class MaterialOutboundDTO {

    @NotNull(message = "批次ID不能为空")
    private Long batchId;

    @NotNull(message = "出库数量不能为空")
    private BigDecimal quantity;

    private Long workOrderId;

    private String operator;

    private String remark;
}
