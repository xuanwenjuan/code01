package com.ancientpaper.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("finance_ledger")
public class FinanceLedger extends BaseEntity {
    private String ledgerNo;
    private Long categoryId;
    private Long orderId;
    private BigDecimal materialCost;
    private BigDecimal laborCost;
    private BigDecimal workHourCost;
    private BigDecimal salesRevenue;
    private BigDecimal totalProfit;
    private BigDecimal productionQuantity;
    private BigDecimal salesQuantity;
    private LocalDate statDate;
    private String remarks;
}