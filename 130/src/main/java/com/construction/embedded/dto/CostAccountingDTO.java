package com.construction.embedded.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CostAccountingDTO {
    private Long id;

    private String accountingNo;

    private Long categoryId;

    @NotBlank(message = "核算月份不能为空")
    @Pattern(regexp = "^\\d{4}-\\d{2}$", message = "核算月份格式必须为yyyy-MM")
    private String accountingMonth;

    @PositiveOrZero(message = "原料成本不能为负数")
    private BigDecimal materialCost;

    @PositiveOrZero(message = "设备损耗不能为负数")
    private BigDecimal equipmentLoss;

    @PositiveOrZero(message = "防腐处理开销不能为负数")
    private BigDecimal coatingCost;

    @PositiveOrZero(message = "人工工时成本不能为负数")
    private BigDecimal laborCost;

    @PositiveOrZero(message = "报废损失不能为负数")
    private BigDecimal scrapLoss;

    private BigDecimal totalCost;

    @PositiveOrZero(message = "生产数量不能为负数")
    private Integer productionQuantity;

    private BigDecimal unitCost;

    private String status;

    private String remark;
}
