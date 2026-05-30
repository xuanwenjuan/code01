package com.snack.processing.dto.workorder;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProcessCompleteDTO {

    private Long workOrderId;
    private String processCode;
    private BigDecimal outputQuantity;
    private BigDecimal defectiveQuantity;
    private BigDecimal energyConsumption;
    private BigDecimal laborHours;
    private String remark;
}
