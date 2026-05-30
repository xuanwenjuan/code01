package com.fastener.production.entity.material.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class MaterialInboundDTO {

    @NotNull(message = "原料ID不能为空")
    private Long materialId;

    @NotNull(message = "入库数量不能为空")
    private BigDecimal quantity;

    @NotNull(message = "入库单价不能为空")
    private BigDecimal unitPrice;

    private LocalDate productionDate;

    private LocalDate expirationDate;

    private String warehouseCode;

    private String locationCode;

    private String inspector;

    private String inspectionResult;

    private String remark;
}
