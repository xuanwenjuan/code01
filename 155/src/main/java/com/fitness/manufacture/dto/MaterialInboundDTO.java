package com.fitness.manufacture.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class MaterialInboundDTO {

    private Long id;

    @NotNull(message = "物料ID不能为空")
    private Long materialId;

    private String materialName;

    private String batchNo;

    @NotNull(message = "入库数量不能为空")
    private BigDecimal quantity;

    private BigDecimal unitPrice;

    private String supplier;

    private LocalDate productionDate;

    private LocalDate expiryDate;

    private String warehouseLocation;

    private String remark;
}
