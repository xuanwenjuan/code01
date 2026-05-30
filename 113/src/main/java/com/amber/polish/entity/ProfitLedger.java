package com.amber.polish.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("profit_ledger")
public class ProfitLedger extends BaseEntity {

    private String ledgerNo;

    private Long categoryId;

    private Long orderId;

    private BigDecimal rawStoneCost;

    private BigDecimal materialCost;

    private BigDecimal laborCost;

    private BigDecimal totalCost;

    private BigDecimal orderIncome;

    private BigDecimal profitAmount;

    private BigDecimal profitRate;

    private LocalDate ledgerDate;

    private String remark;
}
