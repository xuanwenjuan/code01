package com.leathercraft.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ProfitLedgerDTO {
    private Long productCategoryId;

    private String productCategoryName;

    @NotNull(message = "成品数量不能为空")
    @Positive(message = "成品数量必须大于0")
    private Integer quantity;

    @NotNull(message = "原皮采购成本不能为空")
    @PositiveOrZero(message = "原皮采购成本不能为负数")
    private BigDecimal leatherCost;

    @NotNull(message = "耗材费用不能为空")
    @PositiveOrZero(message = "耗材费用不能为负数")
    private BigDecimal materialCost;

    @NotNull(message = "人工工时费用不能为空")
    @PositiveOrZero(message = "人工工时费用不能为负数")
    private BigDecimal laborCost;

    @NotNull(message = "销售总价不能为空")
    @PositiveOrZero(message = "销售总价不能为负数")
    private BigDecimal sellingPrice;

    @NotNull(message = "统计日期不能为空")
    private LocalDate statDate;

    private String remark;
}
