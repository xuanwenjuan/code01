package com.foundry.impeller.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class WorkOrderMaterialDTO {

    private Long materialId;

    private String materialName;

    private BigDecimal usageQuantity;

    private String unit;
}
