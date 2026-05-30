package com.naturaldye.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class WorkOrderCompleteDTO {

    @NotNull(message = "工单ID不能为空")
    private Long workOrderId;

    private BigDecimal actualFabricConsumption;

    private BigDecimal actualDyeConsumption;

    private BigDecimal laborHours;

    private BigDecimal waterElectricityCost;

    private BigDecimal equipmentLoss;

    private BigDecimal otherCost;

    private String qualityInspectionResult;

    @Valid
    private List<MaterialLossDTO> materialLosses;
}
