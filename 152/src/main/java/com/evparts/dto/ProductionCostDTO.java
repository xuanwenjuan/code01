package com.evparts.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class ProductionCostDTO {

    private Long id;

    @NotNull(message = "工单ID不能为空")
    private Long workOrderId;

    private BigDecimal totalMoldCost;

    private BigDecimal totalEnergyCost;

    private BigDecimal totalLaborCost;

    private BigDecimal totalScrapCost;

    @NotNull(message = "成本核算日期不能为空")
    private LocalDate costDate;

    private String remark;

    private List<CostDetailDTO> costDetails;

}
