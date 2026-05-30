package com.sheetmetal.compressor.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ProductionCostDTO {
    private Long id;

    @NotNull(message = "外壳分类ID不能为空")
    private Long categoryId;

    private String categoryName;

    private Long orderId;

    private String orderNo;

    @NotNull(message = "生产数量不能为空")
    private Integer productionQuantity;

    private BigDecimal materialCost = BigDecimal.ZERO;

    private BigDecimal equipmentCost = BigDecimal.ZERO;

    private BigDecimal sprayCost = BigDecimal.ZERO;

    private BigDecimal laborCost = BigDecimal.ZERO;

    private BigDecimal defectiveCost = BigDecimal.ZERO;

    private BigDecimal otherCost = BigDecimal.ZERO;

    private BigDecimal totalCost;

    private BigDecimal unitCost;

    private LocalDate costDate;

    private String quarter;

    private String remark;
}
