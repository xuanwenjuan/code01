package com.amber.polish.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ProfitLedgerDTO {

    @NotNull(message = "品类ID不能为空")
    private Long categoryId;

    private Long orderId;

    @PositiveOrZero(message = "原石采购成本不能为负数")
    private BigDecimal rawStoneCost;

    @PositiveOrZero(message = "耗材支出不能为负数")
    private BigDecimal materialCost;

    @PositiveOrZero(message = "人工费用不能为负数")
    private BigDecimal laborCost;

    @Positive(message = "订单收入必须为正数")
    private BigDecimal orderIncome;

    private LocalDate ledgerDate;

    private String remark;
}
