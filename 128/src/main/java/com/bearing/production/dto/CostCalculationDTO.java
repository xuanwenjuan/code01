package com.bearing.production.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CostCalculationDTO {

    @NotNull(message = "工单ID不能为空")
    private Long workOrderId;

    @DecimalMin(value = "0", message = "原料损耗不能为负数")
    private BigDecimal materialWaste;

    @DecimalMin(value = "0", message = "设备损耗不能为负数")
    private BigDecimal equipmentWear;

    @DecimalMin(value = "0", message = "能耗费用不能为负数")
    private BigDecimal energyCost;

    @DecimalMin(value = "0", message = "人工成本不能为负数")
    private BigDecimal laborCost;

    @DecimalMin(value = "0", message = "次品数量不能为负数")
    private BigDecimal defectiveQuantity;

    @DecimalMin(value = "0", message = "次品损失不能为负数")
    private BigDecimal defectiveLoss;

    private String qualityInspector;

    private String remark;
}
