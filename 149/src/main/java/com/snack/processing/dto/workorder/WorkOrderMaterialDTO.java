package com.snack.processing.dto.workorder;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class WorkOrderMaterialDTO {

    private Long materialId;
    private String materialName;
    private String materialCode;
    private BigDecimal planQuantity;
    private String unit;
    private BigDecimal unitPrice;
}
