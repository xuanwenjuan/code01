package com.evparts.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class WorkOrderProcessDTO {

    private Long processId;
    private Integer qualifiedQuantity;
    private Integer badQuantity;
    private BigDecimal materialLoss;
    private BigDecimal energyConsumption;
    private BigDecimal laborHours;
    private String remark;

}
