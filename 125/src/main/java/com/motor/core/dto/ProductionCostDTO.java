package com.motor.core.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ProductionCostDTO {
    @NotNull(message = "统计日期不能为空")
    private LocalDate costDate;

    @NotNull(message = "产品类目ID不能为空")
    private Long categoryId;

    private Long orderId;

    private BigDecimal materialCost;

    private BigDecimal materialWaste;

    private BigDecimal energyCost;

    private BigDecimal energyConsumption;

    private BigDecimal laborCost;

    private BigDecimal laborHours;

    private BigDecimal defectiveCost;

    private Integer defectiveQuantity;

    @NotNull(message = "生产数量不能为空")
    @Positive(message = "生产数量必须大于0")
    private Integer productionQuantity;

    private BigDecimal salePrice;

    private String remark;
}
