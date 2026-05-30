package com.textile.production.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class RawMaterialBatchDTO {

    private Long id;

    @NotNull(message = "原料ID不能为空")
    private Long materialId;

    @NotNull(message = "批次数量不能为空")
    private BigDecimal quantity;

    private BigDecimal unitPrice;

    private String supplier;

    private LocalDate productionDate;

    private LocalDate expiryDate;

    private String warehouseArea;

    private BigDecimal humidity;
}
